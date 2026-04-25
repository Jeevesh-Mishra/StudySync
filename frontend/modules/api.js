/* ═══════════════════════════════════════
   API MODULE — StudySync+
   ═══════════════════════════════════════ */

const Api = (() => {
  const BASE = 'https://studysync-production-c350.up.railway.app/api/v1';

  const getToken = () => localStorage.getItem('studysync_token');
  const setToken = (token) => localStorage.setItem('studysync_token', token);
  const removeToken = () => localStorage.removeItem('studysync_token');

  const getUser = () => {
    const u = localStorage.getItem('studysync_user');
    return u ? JSON.parse(u) : null;
  };
  const setUser = (user) => localStorage.setItem('studysync_user', JSON.stringify(user));
  const removeUser = () => localStorage.removeItem('studysync_user');

  const request = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = { ...(options.headers || {}) };

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(`${BASE}${endpoint}`, {
        ...options,
        headers,
        body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      return data;
    } catch (err) {
      if (err.message === 'Invalid or expired token.' || err.message === 'Not authenticated. Please log in.') {
        removeToken();
        removeUser();
        window.location.hash = '#/login';
      }
      throw err;
    }
  };

  const get = (endpoint) => request(endpoint);
  const post = (endpoint, body) => request(endpoint, { method: 'POST', body });
  const put = (endpoint, body) => request(endpoint, { method: 'PUT', body });
  const del = (endpoint) => request(endpoint, { method: 'DELETE' });
  const upload = (endpoint, formData) => request(endpoint, { method: 'POST', body: formData, headers: {} });

  return {
    getToken, setToken, removeToken,
    getUser, setUser, removeUser,
    get, post, put, del, upload
  };
})();
