// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json).
// The database connection and first-run seeding are shared across warm invocations.
import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { seedIfEmpty, ensureAdmin } from '../server/src/seed/seed.js';

const app = createApp();
let ready = null;

export default async function handler(req, res) {
  if (!process.env.JWT_SECRET) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'JWT_SECRET is not set in the Vercel project settings' }));
  }
  ready ??= connectDB().then(() => seedIfEmpty()).then(() => ensureAdmin());
  try {
    await ready;
  } catch (err) {
    ready = null;
    console.error('[startup]', err.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: err.message }));
  }
  return app(req, res);
}
