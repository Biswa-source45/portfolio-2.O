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
  // Fields added after launch get their defaults on existing databases.
  await Profile.updateMany({ nickname: { $exists: false } }, { $set: { nickname: data.profile.nickname } });
  await applyCopyFixes();
}

// Default copy that was later rewritten (em dashes removed). Databases seeded
// earlier get the new wording, but only where the old default text is still
// there word for word, so anything edited in the admin panel is left alone.
const OLD = {
  about:
    "I'm a full-stack developer building production Generative AI and Agentic AI systems — real-time voice agents, RAG pipelines and LLM-powered document automation. I'm full-stack too: React, Next.js and Node.js, shipping REST and WebSocket APIs, webhooks and secure web apps end to end.",
  stat: 'First place — a college project expo and a college hackathon.',
  period: 'May 2026 — Present',
  highlight:
    'Modular asynchronous services with third-party API integrations and workflow orchestration — adopted by 99% of the internal team, cutting manual operational effort.',
  award: 'Built AI agents for an ERP system with FastAPI, LangGraph, ChromaDB and LLM workflows — plus the frontend landing site.',
};

async function applyCopyFixes() {
  const NEW = {
    about: data.profile.about,
    stat: data.profile.stats[2].label,
    period: data.experience[0].period,
    highlight: data.experience[0].highlights[3].text,
    award: data.achievements[0].description,
  };
  await Promise.all([
    Profile.updateMany({ about: OLD.about }, { $set: { about: NEW.about } }),
    Profile.updateMany({ 'stats.label': OLD.stat }, { $set: { 'stats.$[s].label': NEW.stat } }, { arrayFilters: [{ 's.label': OLD.stat }] }),
    Experience.updateMany({ period: OLD.period }, { $set: { period: NEW.period } }),
    Experience.updateMany(
      { 'highlights.text': OLD.highlight },
      { $set: { 'highlights.$[h].text': NEW.highlight } },
      { arrayFilters: [{ 'h.text': OLD.highlight }] }
    ),
    Achievement.updateMany({ description: OLD.award }, { $set: { description: NEW.award } }),
  ]);
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
