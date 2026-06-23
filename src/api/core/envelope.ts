import type { AxiosResponse } from 'axios';
import type { TApiResponse } from './types';

/**
 * Peel Laravel's `{ success, statusCode, message, data }` envelope
 * so callers see only the typed payload.
 */
export const unwrap = <T>(res: AxiosResponse<TApiResponse<T>>): T => res.data.data;
