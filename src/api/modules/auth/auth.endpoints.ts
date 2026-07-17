export const AuthEndpoints = {
	login: '/auth/login',
	register: '/auth/register',
	logout: '/auth/logout',
	refresh: '/auth/refresh',
	forgotPassword: '/auth/forgot-password',
	resetPassword: '/auth/reset-password',
	resendVerification: '/auth/resend-verification-email',
	verifyEmail: (id: string, hash: string) => `/verify-email/${id}/${hash}`,
} as const;

export const UserEndpoints = {
	me: '/user',
	update: '/user',
	destroy: '/user',
	changePassword: '/user/change-password',
	dismissOnboarding: '/user/dismiss-onboarding',
	uploadAvatar: '/user/avatar',
	deleteAvatar: '/user/avatar',
} as const;
