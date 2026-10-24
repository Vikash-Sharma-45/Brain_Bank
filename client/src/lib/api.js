/**
 * Centralized API client for BrainBank
 * Handles cookie-based auth credentials, JSON serialization, and error normalization.
 */

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const { body, headers = {}, ...customConfig } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const config = {
    method: options.method || 'GET',
    credentials: 'include', // Include httpOnly cookies across requests
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  // If endpoint is relative (e.g. '/api/auth/me'), Vite proxy or base handles it
  const url = endpoint.startsWith('http') ? endpoint : endpoint;

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new ApiError(
      networkError.message || 'Network error — unable to reach the server',
      0
    );
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      (Array.isArray(data?.errors)
        ? data.errors.map((e) => e.message).join(', ')
        : response.statusText || 'An unexpected error occurred');

    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export const api = {
  get: (url, options) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
  put: (url, body, options) => request(url, { ...options, method: 'PUT', body }),
  patch: (url, body, options) => request(url, { ...options, method: 'PATCH', body }),
  delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
};

export default api;
