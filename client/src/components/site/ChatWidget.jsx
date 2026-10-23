import { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ArrowClockwise, Sparkle, X } from '@phosphor-icons/react';
import { streamChat } from '../../lib/api.js';

// Renders the assistant's light markdown (**bold**, "- " bullets, links) without innerHTML.
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^https?:\/\//.test(part))
      return (
        <a key={i} href={part} target="_blank" rel="noreferrer" className="break-all underline underline-offset-2">
          {part}
        </a>
      );
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function RichText({ text }) {
  const blocks = [];
  text.split('\n').forEach((line) => {
    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    const last = blocks.at(-1);
    if (bullet) {
      if (last?.type === 'ul') last.items.push(bullet[1]);
      else blocks.push({ type: 'ul', items: [bullet[1]] });
    } else if (line.trim()) blocks.push({ type: 'p', text: line });
  });
  return blocks.map((b, i) =>
    b.type === 'ul' ? (
      <ul key={i} className="my-1.5 list-disc space-y-1 pl-4">
        {b.items.map((it, j) => (
          <li key={j}>{inline(it)}</li>
        ))}
      </ul>
    ) : (
      <p key={i} className="my-1.5 first:mt-0 last:mb-0">
        {inline(b.text)}
      </p>
    )
  );
}

const Dots = () => (
  <span className="flex gap-1 py-1.5">
    {[0, 1, 2].map((i) => (
      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
    ))}
  </span>
);

export default function ChatWidget({ profile }) {
  const greeting = { role: 'assistant', content: profile.ai?.greeting || `Hi! Ask me anything about ${profile.name}.` };
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useRef(null);
  const inputRef = useRef(null);
  const abort = useRef(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const ask = async (question) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput('');
    const history = [...messages.slice(1), { role: 'user', content: q }];
    setMessages([greeting, ...history, { role: 'assistant', content: '', pending: true }]);
    setBusy(true);
    abort.current = new AbortController();
    const patchLast = (fn) => setMessages((m) => [...m.slice(0, -1), fn(m.at(-1))]);
    try {
      await streamChat(history, {
        signal: abort.current.signal,
        onDelta: (text) => patchLast((last) => ({ ...last, content: last.content + text, pending: false })),
      });
      patchLast((last) => ({ ...last, pending: false }));
    } catch (err) {
      if (err.name !== 'AbortError') patchLast(() => ({ role: 'assistant', content: err.message, error: true }));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    abort.current?.abort();
    setMessages([greeting]);
  };

  const showSuggestions = messages.length === 1 && profile.ai?.suggestions?.length > 0;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Ask the AI assistant'}
        aria-expanded={open}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 16 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full bg-ink py-3 pl-4 pr-5 text-sm font-semibold text-bg shadow-2xl shadow-black/20"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 's'} initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }} transition={{ duration: 0.2 }}>
            {open ? <X size={18} weight="bold" /> : <Sparkle size={18} weight="fill" className="text-accent" />}
          </motion.span>
        </AnimatePresence>
        {open ? 'Close' : 'Ask AI about me'}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Portfolio assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed inset-x-3 bottom-20 z-[70] flex h-[min(600px,calc(100svh-7rem))] flex-col overflow-hidden rounded-[26px] border border-line bg-surface shadow-2xl shadow-black/20 sm:inset-x-auto sm:right-5 sm:w-[400px]"
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <div className="relative">
                {profile.photo ? (
                  <img src={profile.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-bg">AI</span>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 grid h-4.5 w-4.5 place-items-center rounded-full bg-accent text-accent-ink">
                  <Sparkle size={10} weight="fill" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">Ask about {profile.name.split(' ')[0]}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> AI assistant · answers from this portfolio
                </p>
              </div>
              <button type="button" onClick={reset} aria-label="Start over" className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink">
                <ArrowClockwise size={16} />
              </button>
            </div>

            <div ref={list} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-5">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.925rem] leading-relaxed ${
                      m.role === 'user' ? 'rounded-br-md bg-ink text-bg' : m.error ? 'rounded-bl-md bg-red-500/10 text-red-600' : 'rounded-bl-md bg-ink/[0.05]'
                    }`}
                  >
                    {m.pending ? <Dots /> : m.role === 'user' ? m.content : <RichText text={m.content} />}
                  </div>
                </motion.div>
              ))}
              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.ai.suggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                      className="rounded-full border border-line px-3 py-1.5 text-left text-xs transition-colors hover:border-accent hover:text-accent"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-line p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, skills, experience…"
                maxLength={500}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-ink transition-opacity disabled:opacity-40">
                <ArrowUp size={18} weight="bold" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
