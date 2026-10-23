import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const profileSchema = new Schema(
  {
    name: { type: String, required: true },
    nickname: String,
    role: String,
    headline: String,
    about: String,
    location: String,
    email: String,
    phone: String,
    photo: String,
    resumeUrl: String,
    availability: String,
    socials: {
      github: String,
      linkedin: String,
      twitter: String,
      website: String,
    },
    stats: [{ value: Number, suffix: String, label: String }],
    education: [{ kind: String, title: String, place: String }],
    languages: [String],
    marquee: [String],
    ai: {
      enabled: { type: Boolean, default: true },
      greeting: String,
      suggestions: [String],
      extraContext: String,
    },
  },
  { timestamps: true }
);

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    category: String,
    description: String,
    tags: [String],
    image: String,
    liveUrl: String,
    repoUrl: String,
    note: String,
    featured: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const experienceSchema = new Schema(
  {
    company: { type: String, required: true },
    role: String,
    period: String,
    location: String,
    current: { type: Boolean, default: false },
    highlights: [{ title: String, text: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const skillGroupSchema = new Schema(
  {
    title: { type: String, required: true },
    items: [String],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const achievementSchema = new Schema(
  {
    rank: String,
    title: { type: String, required: true },
    description: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const messageSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 4000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const statSchema = new Schema({
  key: { type: String, unique: true },
  count: { type: Number, default: 0 },
});

// Server-side settings managed from the admin panel (e.g. the encrypted AI key).
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: String,
  },
  { timestamps: true }
);

// Images uploaded from the admin panel live in the database, so they survive
// redeploys on hosts without a persistent disk (Vercel, Render free tier).
const uploadSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: Number,
  },
  { timestamps: true }
);

export const Profile = model('Profile', profileSchema);
export const Upload = model('Upload', uploadSchema);
export const Setting = model('Setting', settingSchema);
export const Project = model('Project', projectSchema);
export const Experience = model('Experience', experienceSchema);
export const SkillGroup = model('SkillGroup', skillGroupSchema);
export const Achievement = model('Achievement', achievementSchema);
export const Message = model('Message', messageSchema);
export const User = model('User', userSchema);
export const Stat = model('Stat', statSchema);
