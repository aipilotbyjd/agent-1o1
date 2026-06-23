export const EnvironmentEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/environments`,
	create: (ws: string) => `/workspaces/${ws}/environments`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/environments/${id}`,
	update: (ws: string, id: string) => `/workspaces/${ws}/environments/${id}`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/environments/${id}`,
} as const;
