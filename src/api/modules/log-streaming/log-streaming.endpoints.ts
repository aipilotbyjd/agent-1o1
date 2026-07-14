export const LogStreamingEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/log-streaming`,
	create: (ws: string) => `/workspaces/${ws}/log-streaming`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/log-streaming/${id}`,
	update: (ws: string, id: string) => `/workspaces/${ws}/log-streaming/${id}`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/log-streaming/${id}`,
} as const;
