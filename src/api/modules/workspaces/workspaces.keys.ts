export const workspaceKeys = {
	all: () => ['workspaces'] as const,
	list: (params?: unknown) => ['workspaces', 'list', params] as const,
	detail: (id: string) => ['workspaces', 'detail', id] as const,
};
