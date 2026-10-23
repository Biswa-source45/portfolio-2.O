import bcrypt from 'bcryptjs';
import { Profile, Project, Experience, SkillGroup, Achievement, User } from '../models/index.js';
import * as data from './data.js';

export async function seedIfEmpty({ force = false } = {}) {
  if (force) {
    await Promise.all([Profile, Project, Experience, SkillGroup, Achievement].map((M) => M.deleteMany({})));
  }
  if ((await Profile.countDocuments()) === 0) {
    await Profile.create(data.profile);
    await Project.insertMany(data.projects);
    await Experience.insertMany(data.experience);
    await SkillGroup.insertMany(data.skills);
    await Achievement.insertMany(data.achievements);
    console.log('[seed] portfolio content created');
  }
}

export async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@biswa.dev').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn('[auth] ADMIN_PASSWORD is not set. Set it in server/.env to enable the admin login.');
    return;
  }
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({ email, passwordHash: await bcrypt.hash(password, 12) });
    console.log('[auth] admin user created for', email);
  } else if (!(await bcrypt.compare(password, existing.passwordHash))) {
    // ADMIN_PASSWORD in .env is the source of truth.
    existing.passwordHash = await bcrypt.hash(password, 12);
    await existing.save();
    console.log('[auth] admin password updated from .env');
  }
}

// `npm run seed` resets portfolio content to the defaults in data.js.
if (process.argv[1]?.endsWith('seed.js')) {
  const { default: dotenv } = await import('dotenv');
  dotenv.config();
  const { connectDB, disconnectDB } = await import('../config/db.js');
  await connectDB();
  await seedIfEmpty({ force: true });
  await ensureAdmin();
  await disconnectDB();
}
