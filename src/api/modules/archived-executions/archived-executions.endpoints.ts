export const ArchivedExecutionEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/executions/archived`,
	stats: (ws: string) => `/workspaces/${ws}/executions/archived/stats`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/executions/archived/${id}`,
	download: (ws: string, id: string) => `/workspaces/${ws}/executions/archived/${id}/download`,
	restore: (ws: string, id: string) => `/workspaces/${ws}/executions/archived/${id}/restore`,
} as const;
