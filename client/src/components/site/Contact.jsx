import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ArrowUpRight, CheckCircle, EnvelopeSimple, GithubLogo, LinkedinLogo, PaperPlaneTilt, SpinnerGap } from '@phosphor-icons/react';
import { api } from '../../lib/api.js';
import { useScrollTo } from './scroll.js';
import Magnetic from './Magnetic.jsx';
import SectionHead from './SectionHead.jsx';

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await api('/contact', { method: 'POST', body: form });
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-6 sm:p-8" data-fade>
      <AnimatePresence mode="wait">
        {status === 'sent' ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
              <CheckCircle size={56} weight="fill" className="text-accent" />
            </motion.span>
            <h3 className="mt-5 font-display text-3xl font-bold">Message sent!</h3>
            <p className="mt-2 text-muted">Thanks for reaching out. Expect a reply soon.</p>
            <button type="button" onClick={() => setStatus('idle')} className="mt-6 text-sm underline underline-offset-4">
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="grid gap-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">Drop a message</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                Name
                <input required className="input" value={form.name} onChange={set('name')} placeholder="Your name" maxLength={120} />
              </label>
              <label className="grid gap-1.5 text-sm">
                Email
                <input required type="email" className="input" value={form.email} onChange={set('email')} placeholder="you@company.com" maxLength={200} />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm">
              Message
              <textarea required rows={6} className="input resize-none" value={form.message} onChange={set('message')} placeholder="Tell me about the role or the build…" maxLength={4000} />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={status === 'sending'} className="group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-bg transition-colors hover:bg-accent hover:text-accent-ink disabled:opacity-60">
              {status === 'sending' ? <SpinnerGap size={18} className="animate-spin" /> : <PaperPlaneTilt size={18} weight="bold" className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Footer({ profile }) {
  const scrollTo = useScrollTo();
  const [views, setViews] = useState(null);
  useEffect(() => {
    // Home bumps the counter once per session; this only reads it.
    api('/visits')
      .then((d) => setViews(d.views))
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-28 flex flex-col gap-4 border-t border-line pt-8 font-mono text-xs uppercase tracking-widest text-muted sm:flex-row sm:items-center sm:justify-between">
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>
      {views !== null && <span>{views.toLocaleString()} visits</span>}
      <button type="button" onClick={() => scrollTo('#top')} className="group inline-flex items-center gap-2 text-left uppercase hover:text-ink">
        Back to top <ArrowUp size={14} className="transition-transform group-hover:-translate-y-1" />
      </button>
    </footer>
  );
}

export default function Contact({ profile }) {
  const links = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, Icon: EnvelopeSimple },
    profile.socials?.github && { label: 'GitHub', value: '@' + profile.socials.github.split('/').filter(Boolean).pop(), href: profile.socials.github, Icon: GithubLogo },
    profile.socials?.linkedin && { label: 'LinkedIn', value: "Let's connect", href: profile.socials.linkedin, Icon: LinkedinLogo },
  ].filter(Boolean);

  return (
    <section id="contact" className="px-4 pb-10 pt-28 sm:px-6 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead index="06" label="Contact" lines={["Let's build", 'something sharp.']} />

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="max-w-md text-lg leading-relaxed text-muted" data-fade>
              {profile.availability}. Also up for interesting freelance builds. Chai first, code next.
            </p>
            <Magnetic strength={0.2} className="mt-10">
              <a href={`mailto:${profile.email}`} className="group inline-flex items-center gap-3 break-all font-display text-[clamp(1.1rem,1.9vw,1.6rem)] font-bold underline decoration-line decoration-2 underline-offset-8 transition-colors hover:text-accent hover:decoration-accent" data-fade>
                {profile.email}
                <ArrowUpRight size={24} weight="bold" className="transition-transform duration-300 group-hover:rotate-45" />
              </a>
            </Magnetic>
            <ul className="mt-12">
              {links.map(({ label, value, href, Icon }) => (
                <li key={label} data-fade>
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="group flex items-center justify-between border-t border-line py-5 transition-[padding] duration-500 hover:px-3">
                    <span className="flex items-center gap-3">
                      <Icon size={20} />
                      <span className="font-mono text-xs uppercase tracking-widest text-muted">{label}</span>
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      {value}
                      <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>

        <Footer profile={profile} />
      </div>
    </section>
  );
}
