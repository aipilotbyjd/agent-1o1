import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
	getAccessToken,
	getRefreshToken,
	isRememberMe,
	setToken,
	clearTokens,
} from '@/api/core/token-manager';

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach((promise) => {
		if (error) promise.reject(error);
		else if (token) promise.resolve(token);
	});
	failedQueue = [];
};

const IS_MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const redirectToLogin = () => {
	if (IS_MOCK_AUTH) return;
	if (!window.location.pathname.includes('/login')) {
		window.location.href = '/login';
	}
};

export const refreshOn401 = (client: AxiosInstance) => {
	client.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const originalRequest = error.config as InternalAxiosRequestConfig & {
				_retry?: boolean;
			};

			if (originalRequest?.url?.includes('/auth/refresh')) {
				return Promise.reject(error);
			}

			if (error.response?.status !== 401 || originalRequest._retry) {
				return Promise.reject(error);
			}

			const currentToken = getAccessToken();
			if (!currentToken) {
				clearTokens();
				redirectToLogin();
				return Promise.reject(error);
			}

			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
						}
						return client(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshToken = getRefreshToken();
				if (!refreshToken) throw new Error('No refresh token available');

				const response = await client.post(
					'/auth/refresh',
					{ refresh_token: refreshToken },
					{ headers: { Authorization: `Bearer ${currentToken}` } },
				);

				const {
					access_token,
					expires_in,
					refresh_token: newRefreshToken,
				} = response.data.data;

				setToken(access_token, expires_in, isRememberMe(), newRefreshToken);
				processQueue(null, access_token);

				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${access_token}`;
				}
				return client(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as Error, null);
				clearTokens();
				redirectToLogin();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		},
	);
};
