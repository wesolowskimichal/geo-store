import axios, { AxiosError } from 'axios';

export type ApiError<T = unknown> = AxiosError<T>;

export const isApiError = <T = unknown>(error: unknown): error is ApiError<T> =>
  !!error && axios.isAxiosError(error);

export const isApiDetailedError = (
  error: unknown
): error is ApiError<{ detail: string }> => {
  return (
    isApiError(error) &&
    error.response !== undefined &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'detail' in error.response.data &&
    typeof error.response.data.detail === 'string'
  );
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
