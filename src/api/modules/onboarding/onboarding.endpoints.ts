export const OnboardingEndpoints = {
	state: '/user/onboarding',
	inviteTeam: '/onboarding/invite-team',
	role: '/onboarding/role',
	plan: '/onboarding/plan',
	discovery: '/onboarding/discovery',
	complete: '/onboarding/complete',
	dismiss: '/user/dismiss-onboarding',
	stripeCheckout: (workspaceId: string) => `/workspaces/${workspaceId}/subscriptions/checkout`,
} as const;
