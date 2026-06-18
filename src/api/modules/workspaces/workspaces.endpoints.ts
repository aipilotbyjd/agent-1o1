export const WorkspaceEndpoints = {
	list: '/workspaces',
	create: '/workspaces',
	detail: (id: string) => `/workspaces/${id}`,
	update: (id: string) => `/workspaces/${id}`,
	delete: (id: string) => `/workspaces/${id}`,
	leave: (id: string) => `/workspaces/${id}/leave`,
	switch: '/user/switch-workspace',
} as const;
