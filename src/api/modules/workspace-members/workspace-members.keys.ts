export const memberKeys = {
	all: (ws: string) => ['members', ws] as const,
	list: (ws: string) => ['members', ws, 'list'] as const,
};

export const invitationKeys = {
	all: (ws: string) => ['invitations', ws] as const,
	list: (ws: string) => ['invitations', ws, 'list'] as const,
};

export const workspaceSettingsKeys = {
	all: (ws: string) => ['workspaceSettings', ws] as const,
	detail: (ws: string) => ['workspaceSettings', ws, 'detail'] as const,
};
