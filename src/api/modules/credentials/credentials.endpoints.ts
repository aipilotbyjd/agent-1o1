export const CredentialEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/credentials`,
	create: (ws: string) => `/workspaces/${ws}/credentials`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/credentials/${id}`,
	update: (ws: string, id: string) => `/workspaces/${ws}/credentials/${id}`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/credentials/${id}`,
	test: (ws: string, id: string) => `/workspaces/${ws}/credentials/${id}/test`,
	refreshToken: (ws: string, id: string) => `/workspaces/${ws}/credentials/${id}/refresh`,
	share: (ws: string, id: string) => `/workspaces/${ws}/credentials/${id}/share`,
	unshare: (ws: string, id: string, userId: string) =>
		`/workspaces/${ws}/credentials/${id}/shares/${userId}`,
	sharingScope: (ws: string, id: string) => `/workspaces/${ws}/credentials/${id}/sharing-scope`,
} as const;

export const OAuthEndpoints = {
	providers: () => '/oauth/providers',
	authorizeUrl: (ws: string) => `/workspaces/${ws}/credentials/oauth/initiate`,
	initiate: (ws: string) => `/workspaces/${ws}/credentials/oauth/initiate`,
	callback: () => `/oauth-credentials/callback`,
} as const;
