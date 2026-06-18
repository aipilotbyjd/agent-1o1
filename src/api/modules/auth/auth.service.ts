import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TMessageResponse } from '@/api/core';
import type {
	TLoginDto,
	TRegisterDto,
	TAuthResponse,
	TAuthWireResponse,
	TForgotPasswordDto,
	TResetPasswordDto,
	TUser,
	TUpdateProfileDto,
	TChangePasswordDto,
	TAvatarResponse,
} from '@/types/auth.type';
import { AuthEndpoints, UserEndpoints } from './auth.endpoints';

const normalizeAuthResponse = (response: TAuthWireResponse): TAuthResponse => {
	const tokens = response.data.tokens ?? response.data.token;
	if (!tokens) throw new Error('Authentication response did not include tokens.');

	return {
		...response,
		data: {
			user: response.data.user,
			tokens,
		},
	};
};

export const AuthService = {
	login: (payload: TLoginDto) =>
		axiosClient
			.post<TAuthWireResponse>(AuthEndpoints.login, payload)
			.then((r) => normalizeAuthResponse(r.data)),

	register: (payload: TRegisterDto) =>
		axiosClient
			.post<TAuthWireResponse>(AuthEndpoints.register, payload)
			.then((r) => normalizeAuthResponse(r.data)),

	logout: () => axiosClient.post(AuthEndpoints.logout).then(() => undefined),

	forgotPassword: (payload: TForgotPasswordDto) =>
		axiosClient
			.post<TMessageResponse>(AuthEndpoints.forgotPassword, payload)
			.then((r) => r.data),

	resetPassword: (payload: TResetPasswordDto) =>
		axiosClient
			.post<TMessageResponse>(AuthEndpoints.resetPassword, payload)
			.then((r) => r.data),

	resendVerification: () =>
		axiosClient.post<TMessageResponse>(AuthEndpoints.resendVerification).then((r) => r.data),

	verifyEmail: (id: string, hash: string, query?: Record<string, string>) =>
		axiosClient
			.get<TMessageResponse>(AuthEndpoints.verifyEmail(id, hash), { params: query })
			.then((r) => r.data),
};

export const UserService = {
	fetchMe: (signal?: AbortSignal) =>
		axiosClient.get<TApiResponse<TUser>>(UserEndpoints.me, { signal }).then(unwrap<TUser>),

	updateProfile: (payload: TUpdateProfileDto) =>
		axiosClient.put<TApiResponse<TUser>>(UserEndpoints.update, payload).then(unwrap<TUser>),

	changePassword: (payload: TChangePasswordDto) =>
		axiosClient
			.put<TMessageResponse>(UserEndpoints.changePassword, payload)
			.then((r) => r.data),

	dismissOnboarding: () =>
		axiosClient.post<TMessageResponse>(UserEndpoints.dismissOnboarding).then((r) => r.data),

	uploadAvatar: async (file: File): Promise<string> => {
		if (!file.type.startsWith('image/')) throw new Error('Avatar must be an image file');
		if (file.size > 2 * 1024 * 1024) throw new Error('Avatar must be 2MB or smaller');

		const formData = new FormData();
		formData.append('avatar', file);
		const { data } = await axiosClient.post<TAvatarResponse>(
			UserEndpoints.uploadAvatar,
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } },
		);
		return data.data.avatar_url;
	},

	deleteAvatar: () => axiosClient.delete(UserEndpoints.deleteAvatar).then(() => undefined),

	destroy: () => axiosClient.delete(UserEndpoints.destroy).then(() => undefined),
};
