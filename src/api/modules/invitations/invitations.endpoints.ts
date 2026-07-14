export const InvitationEndpoints = {
	accept: (token: string) => `/invitations/${token}/accept`,
	decline: (token: string) => `/invitations/${token}/decline`,
} as const;
