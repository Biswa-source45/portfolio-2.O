const TOKEN_KEY = 'admin_token';

export const token = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(value) {
    try {
      value ? localStorage.setItem(TOKEN_KEY, value) : localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

export async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth && token.get()) headers.Authorization = `Bearer ${token.get()}`;
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const adminApi = {
  get: (p) => api(`/admin${p}`, { auth: true }),
  post: (p, body) => api(`/admin${p}`, { method: 'POST', body, auth: true }),
  put: (p, body) => api(`/admin${p}`, { method: 'PUT', body, auth: true }),
  patch: (p, body) => api(`/admin${p}`, { method: 'PATCH', body, auth: true }),
  del: (p) => api(`/admin${p}`, { method: 'DELETE', auth: true }),
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api('/admin/upload', { method: 'POST', body: form, auth: true });
  },
};

// Streams the assistant's reply over server-sent events, calling onDelta for each text chunk.
export async function streamChat(messages, { onDelta, signal }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'The assistant is unavailable right now');
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop();
    for (const raw of events) {
      const event = raw.match(/^event: (.+)$/m)?.[1];
      const data = JSON.parse(raw.match(/^data: (.+)$/m)?.[1] || '{}');
      if (event === 'delta') onDelta(data.text);
      if (event === 'error') throw new Error(data.message);
    }
  }
}
