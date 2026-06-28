import { normalizeApiError } from './apiErrors';

// Centralized backend base URL resolution.
// Prefer VITE_API_BASE_URL if provided.
// During dev, Vite must inject import.meta.env.*; if that is missing, fall back to backend default.
export function resolveApiBaseUrl(): string {
  const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envBase && envBase.trim()) {
    return envBase.replace(/\/$/, '');
  }
  return 'http://localhost:5000';
}

export type ApiErrorShape = ReturnType<typeof normalizeApiError>;

