import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ApiError } from '@google/genai';
import { Stat } from '../models/index.js';
import { getPortfolio, portfolioToText } from '../lib/portfolio.js';
import { getAiConfig } from '../lib/aiConfig.js';

const router = Router();

const limiter = rateLimit({ windowMs: 10 * 60_000, limit: 30, message: { error: 'Too many questions, take a short break and try again' } });

function systemPrompt(data) {
  const p = data.profile;
  return `You are the AI assistant on ${p.name}'s portfolio website. Visitors (recruiters, clients, fellow developers) ask you about ${p.name}: his work, projects, skills, experience and how to reach him.

Answer only from the portfolio data below. If something isn't covered, say you don't know and suggest emailing ${p.email}. Never invent employers, dates, numbers or links.

Style: warm, confident and brief, 2 to 5 sentences or a short list. Speak about ${p.name} in the third person. Reply in the visitor's language (English, Hindi, Hinglish or Odia). Plain text with occasional **bold** and "- " bullets; no headings or tables. Never use em dashes, en dashes, double hyphens or underscores in sentences; use commas, colons or full stops instead. For questions unrelated to ${p.name}, steer back politely to the portfolio.

<portfolio>
${portfolioToText(data)}
</portfolio>`;
}

// Cleans the client-sent history: alternating user/assistant turns ending on the user.
function cleanHistory(raw) {
  const msgs = (Array.isArray(raw) ? raw : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-12);
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  return msgs.length && msgs.at(-1).role === 'user' ? msgs : null;
}

router.post('/', limiter, async (req, res) => {
  const messages = cleanHistory(req.body?.messages);
  if (!messages) return res.status(400).json({ error: 'Send at least one question' });

  const [data, ai] = await Promise.all([getPortfolio(), getAiConfig()]);
  if (!data.profile?.ai?.enabled) return res.status(403).json({ error: 'The assistant is turned off right now' });
  if (!ai.client) return res.status(503).json({ error: "The assistant isn't set up yet" });

  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  const send = (event, payload) => res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  Stat.updateOne({ key: 'chats' }, { $inc: { count: 1 } }, { upsert: true }).catch(() => {});

  // Gemini calls the assistant "model" instead of "assistant".
  const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const abort = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) abort.abort();
  });

  try {
    const stream = await ai.client.models.generateContentStream({
      model: ai.model,
      contents,
      config: { systemInstruction: systemPrompt(data), abortSignal: abort.signal },
    });
    let blocked = false;
    for await (const chunk of stream) {
      if (chunk.text) send('delta', { text: chunk.text });
      if (/SAFETY|PROHIBITED|BLOCKLIST/.test(chunk.candidates?.[0]?.finishReason || '') || chunk.promptFeedback?.blockReason) blocked = true;
    }
    if (blocked) send('delta', { text: "\n\nSorry, I can't help with that. Ask me about Biswa's work instead!" });
    send('done', {});
  } catch (err) {
    if (abort.signal.aborted) return;
    console.error('[chat]', err.status || '', err.message);
    const message = err instanceof ApiError && err.status === 429 ? 'The assistant is busy, try again in a moment.' : 'The assistant hit a problem, please try again.';
    send('error', { message });
  }
  res.end();
});

export default router;
