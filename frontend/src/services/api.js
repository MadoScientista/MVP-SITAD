const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('accessToken');
}

export function setToken(token) {
  localStorage.setItem('accessToken', token);
}

export function clearToken() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  let response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 403 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      config.headers.Authorization = `Bearer ${getToken()}`;
      response = await fetch(`${API_BASE}${endpoint}`, config);
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error en la solicitud');
  }

  return data;
}

async function refreshAccessToken() {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearToken();
      return false;
    }

    const data = await response.json();
    setToken(data.accessToken);
    return true;
  } catch {
    clearToken();
    return false;
  }
}

export const api = {
  get: (url) => request(url, { method: 'GET' }),

  post: (url, body) => request(url, { method: 'POST', body }),

  patch: (url, body) => request(url, { method: 'PATCH', body }),
};
