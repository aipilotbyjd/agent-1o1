export const FolderEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/folders`,
	create: (ws: string) => `/workspaces/${ws}/folders`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/folders/${id}`,
	update: (ws: string, id: string) => `/workspaces/${ws}/folders/${id}`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/folders/${id}`,
	moveWorkflows: (ws: string) => `/workspaces/${ws}/folders/move-workflows`,
} as const;
