export const WorkspaceMemberEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/members`,
	updateRole: (ws: string, user: string | number) => `/workspaces/${ws}/members/${user}`,
	remove: (ws: string, user: string | number) => `/workspaces/${ws}/members/${user}`,
	transferOwnership: (ws: string) => `/workspaces/${ws}/transfer-ownership`,
	leave: (ws: string) => `/workspaces/${ws}/leave`,
} as const;

export const WorkspaceInvitationEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/invitations`,
	send: (ws: string) => `/workspaces/${ws}/invitations`,
	cancel: (ws: string, invitationId: string) => `/workspaces/${ws}/invitations/${invitationId}`,
} as const;

export const WorkspaceSettingsEndpoints = {
	get: (ws: string) => `/workspaces/${ws}/settings`,
	update: (ws: string) => `/workspaces/${ws}/settings`,
} as const;
