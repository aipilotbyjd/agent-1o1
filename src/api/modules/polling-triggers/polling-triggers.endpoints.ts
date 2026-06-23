export const PollingTriggerEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/polling-triggers`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/polling-triggers/${id}`,
	update: (ws: string, id: string) => `/workspaces/${ws}/polling-triggers/${id}`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/polling-triggers/${id}`,
} as const;
