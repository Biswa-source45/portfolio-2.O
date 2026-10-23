import { Profile, Project, Experience, SkillGroup, Achievement } from '../models/index.js';

export async function getPortfolio() {
  const [profile, projects, experience, skills, achievements] = await Promise.all([
    Profile.findOne().lean(),
    Project.find().sort({ order: 1, createdAt: 1 }).lean(),
    Experience.find().sort({ order: 1, createdAt: 1 }).lean(),
    SkillGroup.find().sort({ order: 1, createdAt: 1 }).lean(),
    Achievement.find().sort({ order: 1, createdAt: 1 }).lean(),
  ]);
  return { profile, projects, experience, skills, achievements };
}

// Plain-text knowledge base the AI assistant answers from.
export function portfolioToText({ profile: p, projects, experience, skills, achievements }) {
  const lines = [];
  lines.push(`# ${p.name}`, `Role: ${p.role}`, `Location: ${p.location}`, `Availability: ${p.availability || 'n/a'}`);
  lines.push(`Email: ${p.email}`);
  for (const [k, v] of Object.entries(p.socials || {})) if (v) lines.push(`${k}: ${v}`);
  lines.push('', '## About', p.about || '', p.headline || '');
  if (p.stats?.length) {
    lines.push('', '## Highlights');
    p.stats.forEach((s) => lines.push(`- ${s.value}${s.suffix || ''}: ${s.label}`));
  }
  lines.push('', '## Experience');
  experience.forEach((e) => {
    lines.push(`### ${e.role} at ${e.company} (${e.period}, ${e.location})${e.current ? ' [current]' : ''}`);
    e.highlights?.forEach((h) => lines.push(`- ${h.title}: ${h.text}`));
  });
  lines.push('', '## Projects');
  projects.forEach((pr) => {
    lines.push(`### ${pr.title}: ${pr.subtitle || ''} (${pr.category || ''})`, pr.description || '');
    if (pr.tags?.length) lines.push(`Stack: ${pr.tags.join(', ')}`);
    if (pr.liveUrl) lines.push(`Live: ${pr.liveUrl}`);
    if (pr.repoUrl) lines.push(`Code: ${pr.repoUrl}`);
    if (pr.note) lines.push(`Note: ${pr.note}`);
  });
  lines.push('', '## Skills');
  skills.forEach((s) => lines.push(`- ${s.title}: ${s.items.join(', ')}`));
  lines.push('', '## Awards');
  achievements.forEach((a) => lines.push(`- ${a.rank} place, ${a.title}: ${a.description}`));
  lines.push('', '## Education & certifications');
  p.education?.forEach((e) => lines.push(`- ${e.kind}: ${e.title}, ${e.place}`));
  if (p.languages?.length) lines.push(`Spoken languages: ${p.languages.join(', ')}`);
  if (p.ai?.extraContext) lines.push('', '## Extra notes from Biswa', p.ai.extraContext);
  return lines.join('\n');
}
