export const ExecutionEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/executions`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/executions/${id}`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/executions/${id}`,
	logs: (ws: string, id: string) => `/workspaces/${ws}/executions/${id}/logs`,
	cancel: (ws: string, id: string) => `/workspaces/${ws}/executions/${id}/cancel`,
	retry: (ws: string, id: string) => `/workspaces/${ws}/executions/${id}/retry`,
	replay: (ws: string, id: string) => `/workspaces/${ws}/executions/${id}/replay`,
	nodes: (ws: string, id: string) => `/workspaces/${ws}/executions/${id}/nodes`,
	nodeDetail: (ws: string, id: string, nodeId: string) =>
		`/workspaces/${ws}/executions/${id}/nodes/${nodeId}`,
	stats: (ws: string) => `/workspaces/${ws}/executions/stats`,
	compare: (ws: string) => `/workspaces/${ws}/executions/compare`,
	bulkDelete: (ws: string) => `/workspaces/${ws}/executions/bulk`,
	stream: (ws: string, id: string) => `/workspaces/${ws}/executions/${id}/stream`,
	streamAll: (ws: string) => `/workspaces/${ws}/executions/stream-all`,
} as const;
