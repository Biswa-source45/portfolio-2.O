import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LockKey, SpinnerGap } from '@phosphor-icons/react';
import { api, token } from '../../lib/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api('/auth/login', { method: 'POST', body: { email, password } });
      token.set(res.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-sm">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> Back to site
        </Link>
        <div className="rounded-[28px] border border-line bg-surface p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-bg">
            <LockKey size={22} weight="bold" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Manage portfolio content, messages and the AI assistant.</p>
          <form onSubmit={submit} className="mt-8 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium">
              Email
              <input className="input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Password
              <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={busy} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-ink py-3 font-semibold text-bg transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-60">
              {busy && <SpinnerGap size={16} className="animate-spin" />} Sign in
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
