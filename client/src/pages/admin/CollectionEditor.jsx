import { useEffect, useState } from 'react';
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import { DotsSixVertical, PencilSimple, Plus, SpinnerGap, Trash, X } from '@phosphor-icons/react';
import { adminApi } from '../../lib/api.js';
import { Fields } from '../../components/admin/fields.jsx';
import { useToast } from '../../components/admin/toast.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';

const CONFIG = {
  projects: {
    title: 'Projects',
    subtitle: 'Shown in the horizontal "Selected work" section. Drag to reorder.',
    singular: 'project',
    primary: (d) => d.title,
    secondary: (d) => [d.category, d.subtitle].filter(Boolean).join(' · '),
    fields: [
      { key: 'title', label: 'Title', wide: false },
      { key: 'category', label: 'Category', placeholder: 'AI platform', wide: false },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'tags', label: 'Tech stack', type: 'tags' },
      { key: 'image', label: 'Preview image', type: 'image', hint: 'Leave empty to show the generated artwork.' },
      { key: 'liveUrl', label: 'Live URL', wide: false },
      { key: 'repoUrl', label: 'Repository URL', wide: false },
      { key: 'note', label: 'Note', placeholder: 'Internal enterprise project' },
    ],
  },
  experience: {
    title: 'Experience',
    subtitle: 'Jobs and roles, each with its highlights timeline.',
    singular: 'role',
    primary: (d) => d.company,
    secondary: (d) => [d.role, d.period].filter(Boolean).join(' · '),
    fields: [
      { key: 'company', label: 'Company', wide: false },
      { key: 'role', label: 'Role', wide: false },
      { key: 'period', label: 'Period', placeholder: 'May 2026 — Present', wide: false },
      { key: 'location', label: 'Location', wide: false },
      { key: 'current', label: 'Current role', type: 'checkbox', hint: 'Shows a "Current" badge.' },
      { key: 'highlights', label: 'Highlights', type: 'list', addLabel: 'Add highlight', fields: [{ key: 'title', label: 'Title' }, { key: 'text', label: 'Description', type: 'textarea' }] },
    ],
  },
  skills: {
    title: 'Skills',
    subtitle: 'Toolkit rows, grouped by category.',
    singular: 'group',
    primary: (d) => d.title,
    secondary: (d) => (d.items || []).join(', '),
    fields: [
      { key: 'title', label: 'Group name' },
      { key: 'items', label: 'Skills', type: 'tags' },
    ],
  },
  achievements: {
    title: 'Achievements',
    subtitle: 'Wins and awards.',
    singular: 'achievement',
    primary: (d) => d.title,
    secondary: (d) => d.rank,
    fields: [
      { key: 'rank', label: 'Rank / badge', placeholder: '1st', wide: false },
      { key: 'title', label: 'Title', wide: false },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
};

function Drawer({ config, item, onClose, onSaved }) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = draft._id ? await adminApi.put(`/${config.kind}/${draft._id}`, draft) : await adminApi.post(`/${config.kind}`, draft);
      onSaved(saved);
      toast(`${config.singular[0].toUpperCase() + config.singular.slice(1)} saved`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-40 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.form
        onSubmit={save}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-bg shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-xl font-bold">{draft._id ? `Edit ${config.singular}` : `New ${config.singular}`}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ink/5">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Fields fields={config.fields} value={draft} onChange={setDraft} />
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-medium text-muted hover:text-ink">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent hover:text-accent-ink disabled:opacity-60">
            {saving && <SpinnerGap size={14} className="animate-spin" />} Save
          </button>
        </div>
      </motion.form>
    </>
  );
}

export default function CollectionEditor({ kind }) {
  const config = { ...CONFIG[kind], kind };
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const toast = useToast();

  useEffect(() => {
    setItems(null);
    adminApi.get(`/${kind}`).then(setItems);
  }, [kind]);

  const persistOrder = () => {
    adminApi.put(`/${kind}/reorder`, { ids: items.map((i) => i._id) }).then(() => toast('Order saved'));
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${config.primary(item)}"? This can't be undone.`)) return;
    await adminApi.del(`/${kind}/${item._id}`);
    setItems((list) => list.filter((i) => i._id !== item._id));
    toast('Deleted');
  };

  const onSaved = (saved) => {
    setItems((list) => (list.some((i) => i._id === saved._id) ? list.map((i) => (i._id === saved._id ? saved : i)) : [...list, saved]));
    setEditing(null);
  };

  return (
    <>
      <PageHeader title={config.title} subtitle={config.subtitle}>
        <button type="button" onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent hover:text-accent-ink">
          <Plus size={16} weight="bold" /> Add {config.singular}
        </button>
      </PageHeader>

      {!items ? (
        <div className="grid place-items-center py-20 text-muted">
          <SpinnerGap size={24} className="animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center text-muted">Nothing here yet. Add your first {config.singular}.</div>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={setItems} className="grid gap-2">
          {items.map((item) => (
            <Reorder.Item
              key={item._id}
              value={item}
              onDragEnd={persistOrder}
              whileDrag={{ scale: 1.02, boxShadow: '0 12px 30px rgb(0 0 0 / .12)' }}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 pr-4"
            >
              <span className="grid h-9 w-7 shrink-0 cursor-grab place-items-center text-muted active:cursor-grabbing" title="Drag to reorder">
                <DotsSixVertical size={18} weight="bold" />
              </span>
              {kind === 'projects' && item.image && <img src={item.image} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{config.primary(item)}</p>
                <p className="truncate text-sm text-muted">{config.secondary(item)}</p>
              </div>
              <button type="button" onClick={() => setEditing(item)} aria-label="Edit" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
                <PencilSimple size={16} />
              </button>
              <button type="button" onClick={() => remove(item)} aria-label="Delete" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-red-500/10 hover:text-red-500">
                <Trash size={16} />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <AnimatePresence>{editing && <Drawer config={config} item={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}</AnimatePresence>
    </>
  );
}
