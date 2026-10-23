import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, ChatCircleDots, Code, Eye, List, Robot, Trophy } from '@phosphor-icons/react';
import { adminApi } from '../../lib/api.js';
import PageHeader from '../../components/admin/PageHeader.jsx';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    adminApi.get('/stats').then(setStats);
    adminApi.get('/messages').then((m) => setMessages(m.slice(0, 4)));
  }, []);

  const cards = stats
    ? [
        ['Site visits', stats.views, Eye, null],
        ['AI conversations', stats.chats, Robot, '/admin/ai'],
        ['Messages', stats.messages, ChatCircleDots, '/admin/messages', stats.unread ? `${stats.unread} unread` : null],
        ['Projects', stats.projects, Code, '/admin/projects'],
        ['Experience', stats.experience, Briefcase, '/admin/experience'],
        ['Skill groups', stats.skills, List, '/admin/skills'],
        ['Achievements', stats.achievements, Trophy, '/admin/achievements'],
      ]
    : [];

  return (
    <>
      <PageHeader title="Overview" subtitle="Everything on the portfolio, at a glance." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([label, value, Icon, to, badge], i) => {
          const body = (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group h-full rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-ink/30"
            >
              <div className="flex items-center justify-between text-muted">
                <Icon size={20} />
                {badge && <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-ink">{badge}</span>}
              </div>
              <p className="mt-6 font-display text-4xl font-bold tabular-nums">{value}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </motion.div>
          );
          return to ? (
            <Link key={label} to={to}>
              {body}
            </Link>
          ) : (
            <div key={label}>{body}</div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">Latest messages</h2>
          <Link to="/admin/messages" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            All messages <ArrowRight size={14} />
          </Link>
        </div>
        {messages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No messages yet. They'll show up here when visitors use the contact form.</p>
        ) : (
          <ul>
            {messages.map((m) => (
              <li key={m._id} className="flex gap-4 border-b border-line px-5 py-4 last:border-0">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.read ? 'bg-transparent' : 'bg-accent'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {m.name} <span className="font-normal text-muted">· {m.email}</span>
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted">{m.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
