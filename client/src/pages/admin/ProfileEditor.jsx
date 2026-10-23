import { useEffect, useState } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';
import { adminApi } from '../../lib/api.js';
import { Fields } from '../../components/admin/fields.jsx';
import { useToast } from '../../components/admin/toast.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';

const SECTIONS = [
  {
    title: 'Basics',
    fields: [
      { key: 'name', label: 'Full name', wide: false },
      { key: 'role', label: 'Role', wide: false },
      { key: 'headline', label: 'Hero headline', type: 'textarea', rows: 3 },
      { key: 'about', label: 'About paragraph', type: 'textarea', rows: 5 },
      { key: 'photo', label: 'Photo', type: 'image' },
    ],
  },
  {
    title: 'Contact & links',
    fields: [
      { key: 'email', label: 'Email', wide: false },
      { key: 'location', label: 'Location', wide: false },
      { key: 'availability', label: 'Availability line', placeholder: 'Open to AI engineering & full-stack roles' },
      { key: 'socials.github', label: 'GitHub URL', wide: false },
      { key: 'socials.linkedin', label: 'LinkedIn URL', wide: false },
      { key: 'socials.twitter', label: 'X / Twitter URL', wide: false },
      { key: 'socials.website', label: 'Other website', wide: false },
      { key: 'resumeUrl', label: 'Résumé URL' },
    ],
  },
  {
    title: 'Numbers & extras',
    fields: [
      { key: 'stats', label: 'Stats (About section)', type: 'list', addLabel: 'Add stat', fields: [{ key: 'value', label: 'Number', type: 'number' }, { key: 'suffix', label: 'Suffix, e.g. %+' }, { key: 'label', label: 'Label' }] },
      { key: 'education', label: 'Education & certifications', type: 'list', addLabel: 'Add entry', fields: [{ key: 'kind', label: 'Type, e.g. Education' }, { key: 'title', label: 'Title' }, { key: 'place', label: 'Institution / details' }] },
      { key: 'languages', label: 'Spoken languages', type: 'tags' },
      { key: 'marquee', label: 'Marquee words', type: 'tags', hint: 'The scrolling tech strip under the hero.' },
    ],
  },
];

export default function ProfileEditor() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    adminApi.get('/profile').then(setProfile);
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      setProfile(await adminApi.put('/profile', profile));
      toast('Profile saved');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <SpinnerGap size={24} className="mx-auto mt-20 animate-spin text-muted" />;

  return (
    <form onSubmit={save}>
      <PageHeader title="Profile" subtitle="Your name, intro, links and the numbers on the site.">
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-bg hover:bg-accent hover:text-accent-ink disabled:opacity-60">
          {saving && <SpinnerGap size={14} className="animate-spin" />} Save changes
        </button>
      </PageHeader>
      <div className="grid gap-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-5 font-display text-lg font-bold">{s.title}</h2>
            <Fields fields={s.fields} value={profile} onChange={setProfile} />
          </section>
        ))}
      </div>
    </form>
  );
}
