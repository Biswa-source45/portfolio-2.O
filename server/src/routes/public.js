import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Message, Stat, Upload } from '../models/index.js';
import { getPortfolio } from '../lib/portfolio.js';
import { getAiConfig } from '../lib/aiConfig.js';

const router = Router();

router.get('/portfolio', async (_req, res) => {
  const [data, { apiKey }] = await Promise.all([getPortfolio(), getAiConfig()]);
  if (!data.profile) return res.status(404).json({ error: 'Portfolio not set up yet' });
  // The admin-only AI notes stay server-side; the chat shows only once a key is set.
  const { extraContext, ...ai } = data.profile.ai || {};
  res.json({ ...data, profile: { ...data.profile, ai: { ...ai, available: Boolean(ai.enabled && apiKey) } } });
});

router.get('/uploads/:id', async (req, res) => {
  const file = await Upload.findById(req.params.id).lean();
  if (!file) return res.status(404).json({ error: 'Image not found' });
  res.set({ 'Content-Type': file.contentType, 'Cache-Control': 'public, max-age=31536000, immutable' });
  res.send(Buffer.from(file.data.buffer ?? file.data));
});

router.get('/visits',async (_req, res) => {
  const stat = await Stat.findOne({ key: 'views' }).lean();
  res.json({ views: stat?.count || 0 });
});

router.post('/visit',rateLimit({ windowMs: 60_000, limit: 10 }), async (_req, res) => {
  const stat = await Stat.findOneAndUpdate({ key: 'views' }, { $inc: { count: 1 } }, { upsert: true, new: true });
  res.json({ views: stat.count });
});

const contactLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 5, message: { error: 'Too many messages, try again later' } });

router.post('/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body || {};
  if (![name, email, message].every((v) => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
  await Message.create({ name: name.trim(), email: email.trim(), message: message.trim() });
  res.status(201).json({ ok: true });
});

export default router;
