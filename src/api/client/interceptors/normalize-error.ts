import type { AxiosError, AxiosInstance } from 'axios';
import { ApiError } from '@/api/core/errors';
import { notify } from '@/api/core/notify';

type TErrorBody = {
	message?: string;
	errors?: Record<string, string[]>;
};

export const normalizeError = (client: AxiosInstance) => {
	client.interceptors.response.use(
		(response) => response,
		(error: AxiosError<TErrorBody>) => {
			const status = error.response?.status;
			const message =
				error.response?.data?.message || error.message || 'Something went wrong';
			const fields = error.response?.data?.errors;

			// Global toasts (401 is handled by refresh interceptor)
			switch (status) {
				case 403:
					notify.error('Permission denied');
					break;
				case 404:
					notify.error('Resource not found');
					break;
				case 422:
					notify.error(message || 'Validation error');
					break;
				case 429:
					notify.error('Too many requests. Please slow down.');
					break;
				default:
					if (status && status >= 500) {
						notify.error('Server error. Please try again later.');
					} else if (!status) {
						notify.error('Network error. Check your connection.');
					} else if (status !== 401) {
						notify.error(message);
					}
			}

			return Promise.reject(new ApiError(status, message, fields));
		},
	);
};
