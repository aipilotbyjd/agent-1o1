import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { attachAuth } from './interceptors/attach-auth';
import { refreshOn401 } from './interceptors/refresh-token';
import { normalizeError } from './interceptors/normalize-error';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://agent1o1.test/api/v1';

export const axiosClient = axios.create({
	baseURL: BASE_URL,
	timeout: 30_000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

const SENSITIVE_KEY_PATTERN = /(api[_-]?key|token|secret|password|authorization|credential)/i;

const maskSensitivePayload = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(maskSensitivePayload);
	if (!value || typeof value !== 'object') return value;

	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
			key,
			SENSITIVE_KEY_PATTERN.test(key) ? '***MASKED***' : maskSensitivePayload(entry),
		]),
	);
};

const requestUrl = (config: InternalAxiosRequestConfig | AxiosResponse['config']) =>
	`${config.baseURL ?? ''}${config.url ?? ''}`;

axiosClient.interceptors.request.use((config) => {
	console.info('[API Request]', {
		method: config.method?.toUpperCase(),
		url: requestUrl(config),
		params: config.params,
		data: maskSensitivePayload(config.data),
	});
	return config;
});

axiosClient.interceptors.response.use(
	(response) => {
		console.info('[API Response]', {
			method: response.config.method?.toUpperCase(),
			url: requestUrl(response.config),
			status: response.status,
			data: maskSensitivePayload(response.data),
		});
		return response;
	},
	(error: AxiosError) => {
		console.error('[API Error]', {
			method: error.config?.method?.toUpperCase(),
			url: error.config ? requestUrl(error.config) : undefined,
			status: error.response?.status,
			data: maskSensitivePayload(error.response?.data),
			message: error.message,
		});
		return Promise.reject(error);
	},
);

attachAuth(axiosClient);
refreshOn401(axiosClient);
normalizeError(axiosClient);

export default axiosClient;
