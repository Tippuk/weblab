const API_BASE = '/api'

export const getStoredTokens = () => {
  try {
    return {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token'),
    }
  } catch {
    return { access: null, refresh: null }
  }
}

export const setStoredTokens = (access, refresh) => {
  if (access != null) localStorage.setItem('access_token', access)
  if (refresh != null) localStorage.setItem('refresh_token', refresh)
}

export const clearStoredTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

async function request(path, options = {}) {
  const { access, refresh } = getStoredTokens()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (access) headers['Authorization'] = `Bearer ${access}`

  let res = await fetch(API_BASE + path, { ...options, headers })

  if (res.status === 401 && refresh && !options._retry) {
    const refreshRes = await fetch(API_BASE + '/auth/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${refresh}` },
    })
    if (refreshRes.ok) {
      const data = await refreshRes.json()
      setStoredTokens(data.access_token, null)
      headers['Authorization'] = `Bearer ${data.access_token}`
      res = await fetch(API_BASE + path, { ...options, headers, _retry: true })
    } else {
      clearStoredTokens()
      return { ok: false, status: 401, data: null }
    }
  }

  const data = res.ok
    ? await res.json().catch(() => null)
    : await res.json().catch(() => ({ error: res.statusText }))
  return { ok: res.ok, status: res.status, data }
}

export const api = {
  async getMe() {
    const { access } = getStoredTokens()
    if (!access) return { ok: true, data: { user: null } }
    return request('/auth/me')
  },

  async login(email, password) {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.access_token) setStoredTokens(data.access_token, data.refresh_token)
    return { ok: res.ok, status: res.status, data }
  },

  async register(name, email, password) {
    const res = await fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.access_token) setStoredTokens(data.access_token, data.refresh_token)
    return { ok: res.ok, status: res.status, data }
  },

  logout() {
    clearStoredTokens()
  },

  getArticles: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request('/articles' + (q ? '?' + q : ''))
  },

  postFeedback: (name, email, message) =>
    request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ name, email, message }),
    }),

  getArticle: (id) => request(`/articles/${id}`),
  createArticle: (body) => request('/articles', { method: 'POST', body: JSON.stringify(body) }),
  updateArticle: (id, body) => request(`/articles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteArticle: (id) => request(`/articles/${id}`, { method: 'DELETE' }),
  getComments: (id) => request(`/articles/${id}/comments`),
  addComment: (id, text, authorName) =>
    request(`/articles/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, author_name: authorName }),
    }),
}
