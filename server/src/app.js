import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { CLIENT_DIST } from './lib/paths.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

// The Express app without a database connection or a listening port, so the
// same app runs as a long-lived server (src/index.js) or a Vercel function (api/index.js).
export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', publicRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // On a regular server the API also serves the built React app.
  if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile('index.html', { root: CLIENT_DIST }));
  }

  app.use((err, _req, res, _next) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  });

  return app;
}
