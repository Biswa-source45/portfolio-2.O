import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { seedIfEmpty, ensureAdmin } from './seed/seed.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

await connectDB();
await seedIfEmpty();
await ensureAdmin();

const port = Number(process.env.PORT) || 5000;
createApp().listen(port, () => console.log(`[api] http://localhost:${port}`));
