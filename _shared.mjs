const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export function json(statusCode, payload) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(payload) };
}

export async function authenticate(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) throw new Error('Please sign in again. Your secure session token is missing.');
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Server authentication is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY in Netlify environment variables.');
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Your session could not be verified. Please sign in again.');
  const user = await response.json();
  return { user, token, supabaseUrl, supabaseAnonKey };
}

export async function supabaseRequest(auth, path, options = {}) {
  const response = await fetch(`${auth.supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: auth.supabaseAnonKey,
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new Error(data?.message || data?.hint || `Database request failed (${response.status}).`);
  return data;
}

export function firstMediaUrl(value) {
  if (!value || typeof value !== 'object') return '';
  if (Array.isArray(value)) {
    for (const item of value) { const found = firstMediaUrl(item); if (found) return found; }
    return '';
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === 'url' && typeof child === 'string' && /^https?:\/\//i.test(child)) return child;
  }
  for (const child of Object.values(value)) { const found = firstMediaUrl(child); if (found) return found; }
  return '';
}
