export const userInvitationKeys = {
	all: () => ['user-invitations'] as const,
	byToken: (token: string) => ['user-invitations', 'token', token] as const,
};
