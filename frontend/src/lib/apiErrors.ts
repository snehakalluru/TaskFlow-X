import type { AxiosError } from 'axios';

export type NormalizedApiError = {
  message: string;
  details?: any;
  status?: number;
};

export function normalizeApiError(err: unknown, fallback = 'Request failed') : NormalizedApiError {
  const axiosErr = err as AxiosError<any> | undefined;
  const status = axiosErr?.response?.status;
  const data = axiosErr?.response?.data;

  const message =
    data?.error?.message ||
    data?.message ||
    data?.error?.details?.message ||
    axiosErr?.message ||
    fallback;

  const details = data?.error?.details ?? data?.details;

  return { message: String(message || fallback), details, status };
}

