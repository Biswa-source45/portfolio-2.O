import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const here = path.dirname(fileURLToPath(import.meta.url));
let localServer = null;

// Uses MONGO_URI when set (Atlas or a local mongod). Without it, starts a
// persistent local MongoDB through mongodb-memory-server so `npm run dev`
// works on a fresh machine with zero setup.
export async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri && process.env.VERCEL) {
    throw new Error('MONGO_URI is not set. Add a MongoDB Atlas connection string in the Vercel project settings.');
  }

  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.resolve(here, '../../.mongo-data');
    fs.mkdirSync(dbPath, { recursive: true });
    localServer = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger', port: 27027 },
    });
    uri = localServer.getUri('biswa-portfolio');
    console.warn('[db] MONGO_URI not set, using local dev MongoDB at', dbPath);
    const stop = async () => {
      await disconnectDB();
      process.exit(0);
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  }

  await mongoose.connect(uri);
  console.log('[db] connected');
}

export async function disconnectDB() {
  await mongoose.disconnect();
  await localServer?.stop({ doCleanup: false });
}
