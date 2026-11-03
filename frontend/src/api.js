export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('token');

  // Si hay body y es objeto, lo convertimos a JSON
  let body;
  if (opts.body && typeof opts.body === "object") {
    body = JSON.stringify(opts.body);
  } else {
    body = opts.body;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text ? JSON.parse(text) : null;
}

export async function apiDownload(path, filename) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`No se pudo descargar el archivo (HTTP ${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
