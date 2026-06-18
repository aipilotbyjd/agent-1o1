/**
 * Token Manager
 * Stores access_token, refresh_token, and expiry in localStorage or sessionStorage
 * based on remember-me preference.
 */

const TOKEN_KEYS = {
	ACCESS_TOKEN: 'a1o1_access_token',
	REFRESH_TOKEN: 'a1o1_refresh_token',
	TOKEN_EXPIRY: 'a1o1_token_expiry',
	REMEMBER_ME: 'a1o1_remember_me',
} as const;

export const TOKEN_CHANGE_EVENT = 'a1o1_token_change';

const dispatchTokenChange = () => {
	window.dispatchEvent(new CustomEvent(TOKEN_CHANGE_EVENT));
};

// ─── Getters ─────────────────────────────────────────────────

export const getAccessToken = (): string | null =>
	localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) ||
	sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);

export const getRefreshToken = (): string | null =>
	localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN) ||
	sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

export const getTokenExpiry = (): number | null => {
	const expiry =
		localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY) ||
		sessionStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
	return expiry ? parseInt(expiry, 10) : null;
};

export const isRememberMe = (): boolean => localStorage.getItem(TOKEN_KEYS.REMEMBER_ME) === 'true';

// ─── Setters ─────────────────────────────────────────────────

const clearTokensRaw = (): void => {
	Object.values(TOKEN_KEYS).forEach((key) => {
		localStorage.removeItem(key);
		sessionStorage.removeItem(key);
	});
};

export const setToken = (
	token: string,
	expiresIn: number,
	rememberMe: boolean = false,
	refreshToken?: string,
): void => {
	const storage = rememberMe ? localStorage : sessionStorage;
	clearTokensRaw();
	localStorage.setItem(TOKEN_KEYS.REMEMBER_ME, String(rememberMe));
	storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
	storage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, String(Math.floor(Date.now() / 1000) + expiresIn));
	if (refreshToken) storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
	dispatchTokenChange();
};

export const clearTokens = (): void => {
	clearTokensRaw();
	dispatchTokenChange();
};

// ─── Checks ──────────────────────────────────────────────────

export const isTokenExpired = (): boolean => {
	const expiry = getTokenExpiry();
	if (!expiry) return true;
	return Date.now() / 1000 > expiry - 30; // 30-second buffer
};

export const hasValidToken = (): boolean => !!getAccessToken() && !isTokenExpired();

// ─── Default export (back-compat) ───────────────────────────

const TokenManager = {
	setToken,
	getToken: getAccessToken,
	removeToken: clearTokens,
};

export default TokenManager;
