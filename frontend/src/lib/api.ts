import axios from 'axios';
import { getToken, clearToken } from './storage';
import { resolveApiBaseUrl } from './apiConfig';
import { normalizeApiError } from './apiErrors';

// Single shared axios instance for the entire frontend.
export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

// Token injection
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // Avoid AxiosRequestHeaders typing issues by using a partial assign.
    (config.headers as any) = {
      ...(config.headers as any),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});



// Consistent 401 handling + error normalization (for UI helpers)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(err);
  }
);

export function normalizeErrorForUI(err: unknown) {
  return normalizeApiError(err);
}


