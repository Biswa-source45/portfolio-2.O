import crypto from 'node:crypto';
import { GoogleGenAI, ApiError } from '@google/genai';
import { Setting } from '../models/index.js';

const FALLBACK_MODEL = 'gemini-2.5-flash';

// The saved API key is encrypted with a key derived from JWT_SECRET,
// so changing JWT_SECRET means re-entering the key in the admin panel.
const cipherKey = () => crypto.createHash('sha256').update(String(process.env.JWT_SECRET)).digest();

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', cipherKey(), iv);
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
}

function decrypt(payload) {
  try {
    const [iv, tag, data] = payload.split('.').map((s) => Buffer.from(s, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', cipherKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

const setSetting = (key, value) => Setting.updateOne({ key }, { value }, { upsert: true });
const httpError = (status, message) => Object.assign(new Error(message), { status });

let cached = { apiKey: null, client: null };
function clientFor(apiKey) {
  if (cached.apiKey !== apiKey) cached = { apiKey, client: new GoogleGenAI({ apiKey }) };
  return cached.client;
}

// A key saved from the admin panel takes priority over GEMINI_API_KEY in .env.
export async function getAiConfig() {
  const rows = await Setting.find({ key: { $in: ['geminiApiKey', 'aiModel'] } }).lean();
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const adminKey = s.geminiApiKey ? decrypt(s.geminiApiKey) : null;
  const apiKey = adminKey || process.env.GEMINI_API_KEY || null;
  return {
    apiKey,
    source: adminKey ? 'admin' : apiKey ? 'env' : null,
    model: s.aiModel || process.env.AI_MODEL || FALLBACK_MODEL,
    client: apiKey ? clientFor(apiKey) : null,
  };
}

export async function getAiStatus() {
  const { apiKey, source, model } = await getAiConfig();
  return {
    configured: Boolean(apiKey),
    source,
    keyPreview: apiKey ? `${apiKey.slice(0, 6)}…${apiKey.slice(-4)}` : null,
    model,
  };
}

// Text models the key can use, newest names first.
async function listChatModels(client) {
  const pager = await client.models.list({ config: { pageSize: 100 } });
  const models = [];
  for await (const m of pager) {
    const id = m.name?.replace(/^models\//, '');
    if (id?.startsWith('gemini') && m.supportedActions?.includes('generateContent') && !/image|tts|audio|live|embedding/.test(id)) {
      models.push({ id, label: m.displayName || id });
    }
  }
  return models.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
}

export async function getAvailableModels() {
  const { client } = await getAiConfig();
  if (!client) return [];
  try {
    return await listChatModels(client);
  } catch {
    return [];
  }
}

// Checks the key against the Gemini API before storing it, and picks a
// sensible default model the first time.
export async function saveApiKey(apiKey) {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!/^[\w-]{30,}$/.test(key)) throw httpError(400, "That doesn't look like a Gemini API key (it usually starts with \"AIza\")");
  let models;
  try {
    models = await listChatModels(new GoogleGenAI({ apiKey: key }));
  } catch (err) {
    if (err instanceof ApiError && [400, 401, 403].includes(err.status)) throw httpError(400, 'Google rejected this key. Check it and try again.');
    throw httpError(502, "Couldn't reach Google to verify the key. Try again in a moment.");
  }
  await setSetting('geminiApiKey', encrypt(key));
  if (!(await Setting.exists({ key: 'aiModel' }))) {
    const flash = models.find((m) => /^gemini-[\d.]+-flash$/.test(m.id));
    if (flash) await setSetting('aiModel', flash.id);
  }
}

export async function removeApiKey() {
  await Setting.deleteOne({ key: 'geminiApiKey' });
}

export async function saveModel(model) {
  if (typeof model !== 'string' || !/^gemini-[a-z0-9.-]+$/.test(model)) throw httpError(400, 'Pick a Gemini model');
  await setSetting('aiModel', model);
}
