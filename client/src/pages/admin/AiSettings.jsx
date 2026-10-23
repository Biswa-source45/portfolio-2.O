import { useEffect, useState } from 'react';
import { CheckCircle, Eye, EyeSlash, Key, SpinnerGap, Trash, WarningCircle } from '@phosphor-icons/react';
import { adminApi } from '../../lib/api.js';
import { Fields } from '../../components/admin/fields.jsx';
import { useToast } from '../../components/admin/toast.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';

const FIELDS = [
  { key: 'ai.enabled', label: 'Show the AI assistant on the site', type: 'checkbox', hint: 'The floating "Ask AI about me" button.' },
  { key: 'ai.greeting', label: 'Greeting message', type: 'textarea', rows: 2 },
  { key: 'ai.suggestions', label: 'Suggested questions', type: 'lines', rows: 4, hint: 'One per line. Shown as quick-reply chips.' },
  {
    key: 'ai.extraContext',
    label: 'Extra knowledge for the assistant',
    type: 'textarea',
    rows: 6,
    hint: 'Private notes the AI can use in answers (rates, notice period, hobbies…). Not shown on the site directly.',
  },
];

function ApiKeyCard() {
  const [status, setStatus] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [show, setShow] = useState(false);
  const [models, setModels] = useState([]);
  const [busy, setBusy] = useState('');
  const toast = useToast();

  useEffect(() => {
    adminApi.get('/ai-status').then(setStatus);
  }, []);

  // The model list comes live from Google, so it only exists once a key works.
  useEffect(() => {
    if (status?.configured) adminApi.get('/ai-models').then(setModels);
    else setModels([]);
  }, [status?.configured, status?.keyPreview]);

  const run = async (kind, fn, message) => {
    setBusy(kind);
    try {
      setStatus(await fn());
      toast(message);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy('');
    }
  };

  const saveKey = (e) => {
    e.preventDefault();
    run('save', () => adminApi.put('/ai-key', { apiKey: apiKey.trim() }), 'Gemini key verified and saved');
    setApiKey('');
  };

  const removeKey = () => {
    if (!window.confirm('Remove the saved API key? The assistant will be hidden from the site unless GEMINI_API_KEY is set in server/.env.')) return;
    run('remove', () => adminApi.del('/ai-key'), 'API key removed');
  };

  const setModel = (model) => run('model', () => adminApi.put('/ai-model', { model }), 'Model updated');

  if (!status) return null;

  return (
    <section className="mb-6 rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-bg">
            <Key size={18} weight="bold" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold">Gemini API key</h2>
            <p className="text-sm text-muted">
              Get a free one at{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                Google AI Studio
              </a>
              . It's stored encrypted and never sent to the browser.
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            status.configured ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
          }`}
        >
          {status.configured ? <CheckCircle size={14} weight="fill" /> : <WarningCircle size={14} weight="fill" />}
          {status.configured ? 'Connected' : 'Not connected'}
        </span>
      </div>

      {status.configured && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
          <div className="text-sm">
            <code className="font-mono">{status.keyPreview}</code>
            <span className="ml-2 text-muted">{status.source === 'env' ? 'from server/.env' : 'saved from admin'}</span>
          </div>
          {status.source === 'admin' && (
            <button type="button" onClick={removeKey} disabled={busy === 'remove'} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-60">
              {busy === 'remove' ? <SpinnerGap size={14} className="animate-spin" /> : <Trash size={14} />} Remove key
            </button>
          )}
        </div>
      )}
      {!status.configured && <p className="mt-5 text-sm text-muted">The "Ask AI" button stays hidden on the site until a key is added.</p>}

      <form onSubmit={saveKey} className="mt-5 grid gap-2">
        <label htmlFor="api-key" className="text-sm font-medium">
          {status.source === 'admin' ? 'Replace key' : status.source === 'env' ? 'Override the .env key' : 'Add key'}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="api-key"
              type={show ? 'text' : 'password'}
              autoComplete="off"
              spellCheck={false}
              className="input pr-10 font-mono"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide key' : 'Show key'} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink">
              {show ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={!apiKey.trim() || busy === 'save'} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-bg hover:bg-accent hover:text-accent-ink disabled:opacity-40">
            {busy === 'save' && <SpinnerGap size={14} className="animate-spin" />} Verify & save
          </button>
        </div>
      </form>

      <label className="mt-5 grid gap-1.5 text-sm font-medium">
        Model
        <select className="input" value={status.model} disabled={busy === 'model' || !models.length} onChange={(e) => setModel(e.target.value)}>
          {!models.some((m) => m.id === status.model) && <option value={status.model}>{status.model}</option>}
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} ({m.id})
            </option>
          ))}
        </select>
        <span className="text-xs font-normal text-muted">
          {models.length ? 'Flash models are fast and cheap; Pro models give deeper answers.' : 'Add a key to load the models available to it.'}
        </span>
      </label>
    </section>
  );
}

export default function AiSettings() {
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
      setProfile(await adminApi.put('/profile', { ai: profile.ai }));
      toast('AI settings saved');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <SpinnerGap size={24} className="mx-auto mt-20 animate-spin text-muted" />;

  return (
    <>
      <PageHeader title="AI assistant" subtitle="Answers visitors' questions using everything on this portfolio." />
      <ApiKeyCard />
      <form onSubmit={save} className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold">Behaviour</h2>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-bg hover:bg-accent hover:text-accent-ink disabled:opacity-60">
            {saving && <SpinnerGap size={14} className="animate-spin" />} Save
          </button>
        </div>
        <Fields fields={FIELDS} value={profile} onChange={setProfile} />
      </form>
    </>
  );
}
