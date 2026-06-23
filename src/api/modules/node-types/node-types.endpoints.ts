export const NodeTypeEndpoints = {
	list: '/nodes',
	categories: '/node-categories',
	categoryDetail: (id: string) => `/node-categories/${id}`,
	detail: (nodeType: string) => `/nodes/${nodeType}`,
	recentlyUsed: (workspaceId: string) => `/workspaces/${workspaceId}/nodes/recently-used`,
	customNodes: (workspaceId: string) => `/workspaces/${workspaceId}/nodes/custom`,
} as const;
