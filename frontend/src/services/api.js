const API_BASE = '';

let accessToken = null;

export function getToken() {
  return accessToken;
}

export function setToken(token) {
  accessToken = token;
}

export function clearToken() {
  accessToken = null;
}

async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      clearToken();
      return false;
    }

    const data = await response.json();
    accessToken = data.accessToken;
    return true;
  } catch {
    clearToken();
    return false;
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  delete config.headers['Content-Type'];

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  });

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...config,
    headers,
  });

  if (response.status === 403) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${getToken()}`);
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...config,
        headers,
      });
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error en la solicitud');
  }

  return data;
}

export const api = {
  get: (url) => request(url, { method: 'GET' }),

  post: (url, body) => request(url, { method: 'POST', body }),

  put: (url, body) => request(url, { method: 'PUT', body }),

  patch: (url, body) => request(url, { method: 'PATCH', body }),

  del: (url) => request(url, { method: 'DELETE' }),
};
