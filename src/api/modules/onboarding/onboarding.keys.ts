export const OnboardingKeys = {
	all: ['onboarding'] as const,
	state: () => [...OnboardingKeys.all, 'state'] as const,
};
