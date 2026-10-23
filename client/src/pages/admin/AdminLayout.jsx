import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, ChatCircleDots, Code, List, Robot, SignOut, SquaresFour, Trophy, UserCircle, ArrowSquareOut, X } from '@phosphor-icons/react';
import { api, token } from '../../lib/api.js';
import ThemePicker from '../../components/ThemePicker.jsx';
import { ToastProvider } from '../../components/admin/toast.jsx';

const NAV = [
  ['/admin', 'Overview', SquaresFour, true],
  ['/admin/profile', 'Profile', UserCircle],
  ['/admin/projects', 'Projects', Code],
  ['/admin/experience', 'Experience', Briefcase],
  ['/admin/skills', 'Skills', List],
  ['/admin/achievements', 'Achievements', Trophy],
  ['/admin/messages', 'Messages', ChatCircleDots],
  ['/admin/ai', 'AI assistant', Robot],
];

function Sidebar({ email, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-3 px-2 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-display text-sm font-bold text-bg">BS</span>
        <div className="min-w-0">
          <p className="font-display font-bold leading-tight">Portfolio admin</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
      </div>
      <nav className="mt-6 grid gap-1">
        {NAV.map(([to, label, Icon, end]) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className="relative">
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-ink" transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />}
                <span className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-bg' : 'text-muted hover:text-ink'}`}>
                  <Icon size={18} weight={isActive ? 'fill' : 'regular'} /> {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto grid gap-1 border-t border-line pt-4">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:text-ink">
          <ArrowSquareOut size={18} /> View site
        </a>
        <ThemePicker
          placement="up"
          label="Theme"
          buttonClassName="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted hover:text-ink"
        />
        <button type="button" onClick={onLogout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted hover:text-red-500">
          <SignOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!token.get()) return navigate('/admin/login', { replace: true });
    api('/auth/me', { auth: true })
      .then((me) => setEmail(me.email))
      .catch(() => {
        token.set(null);
        navigate('/admin/login', { replace: true });
      });
  }, [navigate]);

  const logout = () => {
    token.set(null);
    navigate('/admin/login');
  };

  if (!email) return <div className="min-h-screen bg-bg" />;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-line lg:block">
          <Sidebar email={email} onLogout={logout} />
        </aside>

        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/80 px-4 py-3 backdrop-blur lg:hidden">
          <span className="font-display font-bold">Portfolio admin</span>
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-full border border-line">
            <List size={18} />
          </button>
        </header>
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />
              <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 bg-bg lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
                <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="absolute right-4 top-5 grid h-8 w-8 place-items-center rounded-full hover:bg-ink/5">
                  <X size={16} />
                </button>
                <Sidebar email={email} onNavigate={() => setMenuOpen(false)} onLogout={logout} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="mx-auto max-w-5xl">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ToastProvider>
  );
}
