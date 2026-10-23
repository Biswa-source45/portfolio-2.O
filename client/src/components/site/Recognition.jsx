import { Certificate, GraduationCap, Student, Translate, Trophy } from '@phosphor-icons/react';
import SectionHead from './SectionHead.jsx';

const EDU_ICONS = { Education: GraduationCap, 'Higher secondary': Student, Certifications: Certificate };

export default function Recognition({ achievements = [], profile }) {
  const education = profile.education || [];
  if (!achievements.length && !education.length) return null;

  return (
    <section id="recognition" className="px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead index="05" label="Recognition & learning" lines={['Wins under', 'pressure.']} />

        <div className="mt-20 grid gap-5 md:grid-cols-2">
          {achievements.map((a, i) => (
            <div key={a._id} data-fade={i * 0.1} className="group relative overflow-hidden rounded-[28px] border border-line bg-surface p-8 md:p-10">
              <div className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-out-expo group-hover:scale-y-100" />
              <div className="relative transition-colors duration-500 group-hover:text-bg">
                <div className="flex items-start justify-between">
                  <span className="font-display text-8xl font-extrabold leading-none tracking-tighter text-accent md:text-9xl">{a.rank}</span>
                  <Trophy size={28} weight="light" />
                </div>
                <h3 className="mt-10 font-display text-2xl font-bold">{a.title}</h3>
                <p className="mt-3 leading-relaxed opacity-70">{a.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {education.map((e, i) => {
            const Icon = EDU_ICONS[e.kind] || GraduationCap;
            return (
              <div key={i} data-fade={i * 0.08} className="rounded-3xl border border-line p-6">
                <Icon size={22} weight="light" className="text-accent" />
                <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted">{e.kind}</p>
                <h4 className="mt-2 font-semibold">{e.title}</h4>
                <p className="mt-1 text-sm text-muted">{e.place}</p>
              </div>
            );
          })}
          {profile.languages?.length > 0 && (
            <div data-fade={0.3} className="rounded-3xl border border-line p-6">
              <Translate size={22} weight="light" className="text-accent" />
              <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted">Languages</p>
              <h4 className="mt-2 font-semibold">{profile.languages.join(' · ')}</h4>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
