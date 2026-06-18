export const TagEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/tags`,
	create: (ws: string) => `/workspaces/${ws}/tags`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/tags/${id}`,
	update: (ws: string, id: string) => `/workspaces/${ws}/tags/${id}`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/tags/${id}`,
	attachWorkflows: (ws: string, tagId: string) => `/workspaces/${ws}/tags/${tagId}/workflows`,
	detachWorkflows: (ws: string, tagId: string) => `/workspaces/${ws}/tags/${tagId}/workflows`,
} as const;
