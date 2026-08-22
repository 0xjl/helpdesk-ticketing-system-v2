const TOKEN_KEY = 'ticketing_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),

  listTickets: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tickets${qs ? `?${qs}` : ''}`);
  },
  createTicket: (payload) => request('/tickets', { method: 'POST', body: JSON.stringify(payload) }),
  getTicket: (id) => request(`/tickets/${id}`),
  updateTicket: (id, payload) =>
    request(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  claimTicket: (id) => request(`/tickets/${id}/claim`, { method: 'POST' }),
  addComment: (id, body) =>
    request(`/tickets/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),

  listAgents: () => request('/agents'),
};
