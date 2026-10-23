import { useState } from 'react';
import { Plus, Trash, UploadSimple, SpinnerGap, X } from '@phosphor-icons/react';
import { adminApi } from '../../lib/api.js';

export const getPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);

export function setPath(obj, path, value) {
  const [key, ...rest] = path.split('.');
  return { ...obj, [key]: rest.length ? setPath(obj?.[key] || {}, rest.join('.'), value) : value };
}

function TagsInput({ value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const items = draft.split(',').map((s) => s.trim()).filter(Boolean);
    if (items.length) onChange([...value, ...items.filter((t) => !value.includes(t))]);
    setDraft('');
  };
  return (
    <div className="input flex flex-wrap items-center gap-1.5 !py-2">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-ink/[0.07] py-0.5 pl-2.5 pr-1 text-xs">
          {t}
          <button type="button" onClick={() => onChange(value.filter((v) => v !== t))} aria-label={`Remove ${t}`} className="grid h-4 w-4 place-items-center rounded-full hover:bg-ink/10">
            <X size={10} weight="bold" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length ? '' : placeholder || 'Type and press Enter'}
        className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none"
      />
    </div>
  );
}

function ImageInput({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange((await adminApi.upload(file)).url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-ink/[0.03]">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-muted">No image</span>}
      </div>
      <div className="grid flex-1 gap-2">
        <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Image URL or upload" />
        <div className="flex gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:bg-ink hover:text-bg">
            {busy ? <SpinnerGap size={14} className="animate-spin" /> : <UploadSimple size={14} />}
            Upload
            <input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0])} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="rounded-full px-3 py-1.5 text-xs text-muted hover:text-red-500">
              Remove
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

function ListInput({ value = [], onChange, fields, addLabel }) {
  const update = (i, key, v) => onChange(value.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  return (
    <div className="grid gap-3">
      {value.map((row, i) => (
        <div key={i} className="relative grid gap-2 rounded-xl border border-line p-3 pr-11">
          {fields.map((f) =>
            f.type === 'textarea' ? (
              <textarea key={f.key} rows={4} className="input" placeholder={f.label} value={row[f.key] ?? ''} onChange={(e) => update(i, f.key, e.target.value)} />
            ) : (
              <input
                key={f.key}
                type={f.type === 'number' ? 'number' : 'text'}
                className="input"
                placeholder={f.label}
                value={row[f.key] ?? ''}
                onChange={(e) => update(i, f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
              />
            )
          )}
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove row" className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-red-500/10 hover:text-red-500">
            <Trash size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, {}])} className="inline-flex w-fit items-center gap-1.5 rounded-full border border-dashed border-line px-3 py-1.5 text-xs font-medium hover:border-ink">
        <Plus size={12} weight="bold" /> {addLabel || 'Add row'}
      </button>
    </div>
  );
}

// Renders one form field from a { key, label, type, ... } config.
export function Field({ field, value, onChange }) {
  const { label, type = 'text', hint, placeholder } = field;
  let control;
  if (type === 'textarea') control = <textarea rows={field.rows || 4} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
  else if (type === 'tags') control = <TagsInput value={value} onChange={onChange} placeholder={placeholder} />;
  else if (type === 'lines')
    control = <textarea rows={field.rows || 4} className="input" value={(value || []).join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} onBlur={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} placeholder={placeholder} />;
  else if (type === 'image') control = <ImageInput value={value} onChange={onChange} />;
  else if (type === 'list') control = <ListInput value={value} onChange={onChange} fields={field.fields} addLabel={field.addLabel} />;
  else if (type === 'checkbox')
    return (
      <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line px-4 py-3 ${field.wide === false ? '' : 'sm:col-span-2'}`}>
        <span>
          <span className="text-sm font-medium">{label}</span>
          {hint && <span className="block text-xs text-muted">{hint}</span>}
        </span>
        <button type="button" role="switch" aria-checked={Boolean(value)} onClick={() => onChange(!value)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-accent' : 'bg-ink/15'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </label>
    );
  else control = <input className="input" type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;

  return (
    <div className={`grid gap-1.5 ${field.wide === false ? '' : 'sm:col-span-2'}`}>
      <span className="text-sm font-medium">{label}</span>
      {control}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}

export function Fields({ fields, value, onChange }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => (
        <Field key={f.key} field={f} value={getPath(value, f.key)} onChange={(v) => onChange(setPath(value, f.key, v))} />
      ))}
    </div>
  );
}
