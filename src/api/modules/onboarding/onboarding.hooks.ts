import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OnboardingService } from './onboarding.service';
import { OnboardingKeys } from './onboarding.keys';
import { notify } from '@/api/core';

export const useOnboardingState = (enabled = true) => {
	return useQuery({
		queryKey: OnboardingKeys.state(),
		queryFn: ({ signal }) => OnboardingService.fetchState(signal),
		enabled,
	});
};

export const useOnboardingInviteTeam = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: OnboardingService.inviteTeam,
		onSuccess: (data) => {
			queryClient.setQueryData(OnboardingKeys.state(), data);
			notify.success('Team invites sent successfully.');
		},
		onError: (error) => {
			notify.error(error.message || 'Failed to send invites.');
		},
	});
};

export const useOnboardingSelectRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: OnboardingService.selectRole,
		onSuccess: (data) => {
			queryClient.setQueryData(OnboardingKeys.state(), data);
		},
		onError: (error) => {
			notify.error(error.message || 'Failed to select role.');
		},
	});
};

export const useOnboardingSelectPlan = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: OnboardingService.selectPlan,
		onSuccess: (data) => {
			queryClient.setQueryData(OnboardingKeys.state(), data);
		},
		onError: (error) => {
			notify.error(error.message || 'Failed to select plan.');
		},
	});
};

export const useOnboardingStripeCheckout = (workspaceId: string) => {
	return useMutation({
		mutationFn: (payload: { plan_id: string; interval: 'monthly' | 'yearly' }) =>
			OnboardingService.stripeCheckout(workspaceId, payload),
		onSuccess: (data) => {
			if (data.url) {
				window.location.href = data.url;
			}
		},
		onError: (error) => {
			notify.error(error.message || 'Failed to initiate checkout.');
		},
	});
};

export const useOnboardingSubmitDiscovery = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: OnboardingService.submitDiscovery,
		onSuccess: (data) => {
			queryClient.setQueryData(OnboardingKeys.state(), data);
		},
		onError: (error) => {
			notify.error(error.message || 'Failed to submit discovery survey.');
		},
	});
};

export const useOnboardingComplete = () => {
	return useMutation({
		mutationFn: OnboardingService.complete,
		onError: (error) => {
			notify.error(error.message || 'Failed to complete onboarding.');
		},
	});
};

export const useOnboardingDismiss = () => {
	return useMutation({
		mutationFn: OnboardingService.dismiss,
		onError: (error) => {
			notify.error(error.message || 'Failed to skip onboarding.');
		},
	});
};
