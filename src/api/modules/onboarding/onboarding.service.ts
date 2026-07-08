import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TMessageResponse } from '@/api/core';
import { OnboardingEndpoints as E } from './onboarding.endpoints';

export interface IOnboardingStep {
	key: string;
	label: string;
	description: string;
	completed: boolean;
}

export interface IOnboardingMetaPlan {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	price_monthly: number;
	price_yearly: number;
	features: any;
	limits: any;
	trial_days: number;
}

export interface IOnboardingMetaCredentialType {
	id: string;
	key: string;
	name: string;
	description: string;
	auth_type: string;
	icon: string;
}

export interface IOnboardingMetaJobRole {
	value: string;
	label: string;
	description: string;
}

export interface IOnboardingMetaDiscoverySource {
	value: string;
	label: string;
}

export interface IOnboardingMeta {
	workspace_slug_suggestion: string;
	plans: IOnboardingMetaPlan[];
	credential_types: IOnboardingMetaCredentialType[];
	job_roles: IOnboardingMetaJobRole[];
	discovery_sources: IOnboardingMetaDiscoverySource[];
}

export interface IOnboardingStateResponse {
	dismissed: boolean;
	completed: boolean;
	percent: number;
	current_step: string;
	steps: IOnboardingStep[];
	meta: IOnboardingMeta;
}

export const OnboardingService = {
	fetchState: (signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IOnboardingStateResponse>>(E.state, { signal })
			.then(unwrap<IOnboardingStateResponse>),

	inviteTeam: (payload: { emails: string[]; role: string; personal_note?: string }) =>
		axiosClient
			.post<TApiResponse<IOnboardingStateResponse>>(E.inviteTeam, payload)
			.then(unwrap<IOnboardingStateResponse>),

	selectRole: (payload: { job_role: string }) =>
		axiosClient
			.post<TApiResponse<IOnboardingStateResponse>>(E.role, payload)
			.then(unwrap<IOnboardingStateResponse>),

	selectPlan: (payload: { plan_slug: string }) =>
		axiosClient
			.post<TApiResponse<IOnboardingStateResponse>>(E.plan, payload)
			.then(unwrap<IOnboardingStateResponse>),

	stripeCheckout: (workspaceId: string, payload: { plan_id: string; interval: 'monthly' | 'yearly' }) =>
		axiosClient
			.post<TApiResponse<{ url: string }>>(E.stripeCheckout(workspaceId), payload)
			.then(unwrap<{ url: string }>),

	submitDiscovery: (payload: { discovery_source: string }) =>
		axiosClient
			.post<TApiResponse<IOnboardingStateResponse>>(E.discovery, payload)
			.then(unwrap<IOnboardingStateResponse>),

	complete: () =>
		axiosClient
			.post<TApiResponse<any>>(E.complete)
			.then(unwrap<any>),

	dismiss: () =>
		axiosClient
			.post<TMessageResponse>(E.dismiss)
			.then((r) => r.data),
};
