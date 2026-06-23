/**
 * Auth Types
 * Matches the Laravel 12 backend API responses from docs/frontend/modules/01-authentication.md
 */
import type { TApiResponse } from './api.type';
import type { TWorkspace } from './workspace.type';

export type TCurrentWorkspace = Partial<TWorkspace> & {
	id: string;
	name: string;
	slug?: string;
};

export type TOnboardingStepKey =
	| 'verify_email'
	| 'complete_profile'
	| 'create_workspace'
	| 'add_credential'
	| 'create_workflow'
	| 'activate_workflow';

export type TOnboardingStep = {
	key: TOnboardingStepKey;
	label: string;
	description: string;
	done: boolean;
};

export type TOnboardingState = {
	is_complete: boolean;
	is_dismissed: boolean;
	progress: number;
	total: number;
	steps: TOnboardingStep[];
};

export type TUser = {
	id: string;
	name: string;
	email: string;
	avatar: string | null;
	email_verified_at: string | null;
	current_workspace_id: string | null;
	current_workspace: TCurrentWorkspace | null;
	onboarding?: TOnboardingState;
	created_at: string;
	updated_at: string;
	firstName?: string;
	lastName?: string;
	role?: string;
	isVerified?: boolean;
	image?: { org?: string };
};

// ─── Request DTOs ────────────────────────────────────────────

// POST /auth/login
export type TLoginDto = {
	email: string;
	password: string;
};

// POST /auth/register
export type TRegisterDto = {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
};

// POST /auth/forgot-password
export type TForgotPasswordDto = {
	email: string;
};

// POST /auth/reset-password
export type TResetPasswordDto = {
	email: string;
	token: string;
	password: string;
	password_confirmation: string;
};

// PUT /user
export type TUpdateProfileDto = {
	name?: string;
	email?: string;
};

// PUT /user/password
export type TChangePasswordDto = {
	current_password: string;
	password: string;
	password_confirmation: string;
};

// ─── Response Types ──────────────────────────────────────────

// Token object nested inside auth response
export type TAuthToken = {
	token_type: string;
	expires_in: number;
	access_token: string;
	refresh_token: string;
};

// Login / Register response — data payload inside TApiResponse
export type TAuthData = {
	user: TUser;
	tokens: TAuthToken;
};

// Full auth response from backend
export type TAuthResponse = TApiResponse<TAuthData>;

export type TAuthWireResponse = TApiResponse<{
	user: TUser;
	token?: TAuthToken;
	tokens?: TAuthToken;
}>;

// Avatar upload response
export type TAvatarResponse = TApiResponse<{ avatar_url: string }>;
