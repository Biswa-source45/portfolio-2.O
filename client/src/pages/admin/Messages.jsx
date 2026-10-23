import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowBendUpLeft, EnvelopeOpen, EnvelopeSimple, SpinnerGap, Trash } from '@phosphor-icons/react';
import { adminApi } from '../../lib/api.js';
import { useToast } from '../../components/admin/toast.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';

const when = (d) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));

export default function Messages() {
  const [items, setItems] = useState(null);
  const [openId, setOpenId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    adminApi.get('/messages').then(setItems);
  }, []);

  const setRead = async (m, read) => {
    try {
      const updated = await adminApi.patch(`/messages/${m._id}`, { read });
      setItems((list) => list.map((i) => (i._id === m._id ? updated : i)));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const toggle = (m) => {
    setOpenId(openId === m._id ? null : m._id);
    if (!m.read) setRead(m, true);
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    await adminApi.del(`/messages/${m._id}`);
    setItems((list) => list.filter((i) => i._id !== m._id));
    toast('Message deleted');
  };

  return (
    <>
      <PageHeader title="Messages" subtitle="Everything sent through the contact form." />
      {!items ? (
        <SpinnerGap size={24} className="mx-auto mt-20 animate-spin text-muted" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center text-muted">No messages yet.</div>
      ) : (
        <ul className="grid gap-2">
          {items.map((m) => (
            <motion.li layout key={m._id} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <button type="button" onClick={() => toggle(m)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
                <span className={`h-2 w-2 shrink-0 rounded-full ${m.read ? 'bg-ink/15' : 'bg-accent'}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${m.read ? '' : 'font-semibold'}`}>
                    {m.name} <span className="font-normal text-muted">· {m.email}</span>
                  </p>
                  {openId !== m._id && <p className="truncate text-sm text-muted">{m.message}</p>}
                </div>
                <span className="hidden shrink-0 text-xs text-muted sm:block">{when(m.createdAt)}</span>
              </button>
              <AnimatePresence initial={false}>
                {openId === m._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <div className="border-t border-line px-5 py-5 pl-11">
                      <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message')}`} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-bg">
                          <ArrowBendUpLeft size={14} /> Reply by email
                        </a>
                        <button type="button" onClick={() => setRead(m, !m.read)} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium">
                          {m.read ? <EnvelopeSimple size={14} /> : <EnvelopeOpen size={14} />} Mark as {m.read ? 'unread' : 'read'}
                        </button>
                        <button type="button" onClick={() => remove(m)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10">
                          <Trash size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      )}
    </>
  );
}
