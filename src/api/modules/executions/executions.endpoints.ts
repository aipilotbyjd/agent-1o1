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

export const AutofixEndpoints = {
	list: (ws: string, executionId: string) =>
		`/workspaces/${ws}/executions/${executionId}/autofix`,
	diagnose: (ws: string, executionId: string) =>
		`/workspaces/${ws}/executions/${executionId}/autofix`,
	apply: (ws: string, executionId: string, fixId: string) =>
		`/workspaces/${ws}/executions/${executionId}/autofix/${fixId}/apply`,
	dismiss: (ws: string, executionId: string, fixId: string) =>
		`/workspaces/${ws}/executions/${executionId}/autofix/${fixId}/dismiss`,
} as const;

export const ReplayPackEndpoints = {
	create: (ws: string, executionId: string) =>
		`/workspaces/${ws}/executions/${executionId}/replay-pack`,
	list: (ws: string) => `/workspaces/${ws}/replay-packs`,
	replay: (ws: string, replayPackId: string) =>
		`/workspaces/${ws}/replay-packs/${replayPackId}/replay`,
} as const;
