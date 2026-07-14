export const WorkflowEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/workflows`,
	create: (ws: string) => `/workspaces/${ws}/workflows`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
	update: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}`,
	execute: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/execute`,
	activate: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/activate`,
	deactivate: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/deactivate`,
	duplicate: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/duplicate`,
	import: (ws: string) => `/workspaces/${ws}/workflows/import`,
	export: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/export`,
	executions: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/executions`,
	createWebhook: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/webhook`,
	createPollingTrigger: (ws: string, id: string) =>
		`/workspaces/${ws}/workflows/${id}/polling-trigger`,
	availableTriggers: (ws: string, id: string) =>
		`/workspaces/${ws}/workflows/${id}/trigger/available`,
	getTrigger: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/trigger`,
	triggerDetail: (ws: string, id: string, triggerId: string) =>
		`/workspaces/${ws}/workflows/${id}/trigger/${triggerId}`,
	pauseTrigger: (ws: string, id: string, triggerId: string) =>
		`/workspaces/${ws}/workflows/${id}/trigger/${triggerId}/pause`,
	resumeTrigger: (ws: string, id: string, triggerId: string) =>
		`/workspaces/${ws}/workflows/${id}/trigger/${triggerId}/resume`,
} as const;

export const WorkflowEditorEndpoints = {
	versions: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/versions`,
	version: (ws: string, id: string, version: string) =>
		`/workspaces/${ws}/workflows/${id}/versions/${version}`,
	publish: (ws: string, id: string, version: string) =>
		`/workspaces/${ws}/workflows/${id}/versions/${version}/publish`,
	rollback: (ws: string, id: string, version: string) =>
		`/workspaces/${ws}/workflows/${id}/versions/${version}/rollback`,
	compareVersions: (ws: string, id: string, from: string | number, to: string | number) =>
		`/workspaces/${ws}/workflows/${id}/versions/diff/${from}/${to}`,
	build: (ws: string) => `/workspaces/${ws}/workflows/build`,
	testNode: (ws: string) => `/workspaces/${ws}/workflows/test-node`,
	clone: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/clone`,
	nodeOutputSchema: (ws: string, id: string, nodeId: string) =>
		`/workspaces/${ws}/workflows/${id}/nodes/${nodeId}/output-schema`,
	pinnedDataList: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/pinned-data`,
	pinnedDataCreate: (ws: string, id: string) => `/workspaces/${ws}/workflows/${id}/pinned-data`,
	pinnedDataToggle: (ws: string, id: string, pinnedDataId: string) =>
		`/workspaces/${ws}/workflows/${id}/pinned-data/${pinnedDataId}/toggle`,
	pinnedDataDelete: (ws: string, id: string, pinnedDataId: string) =>
		`/workspaces/${ws}/workflows/${id}/pinned-data/${pinnedDataId}`,
} as const;

export const TriggerEventEndpoints = {
	list: (ws: string, triggerId: string) => `/workspaces/${ws}/triggers/${triggerId}/events`,
	replay: (ws: string, triggerId: string, eventId: string) =>
		`/workspaces/${ws}/triggers/${triggerId}/events/${eventId}/replay`,
} as const;

export const WorkflowShareEndpoints = {
	list: (ws: string, workflowId: string) => `/workspaces/${ws}/workflows/${workflowId}/shares`,
	create: (ws: string, workflowId: string) => `/workspaces/${ws}/workflows/${workflowId}/shares`,
	update: (ws: string, workflowId: string, shareId: string) =>
		`/workspaces/${ws}/workflows/${workflowId}/shares/${shareId}`,
	delete: (ws: string, workflowId: string, shareId: string) =>
		`/workspaces/${ws}/workflows/${workflowId}/shares/${shareId}`,
	viewPublic: (token: string) => `/shared/${token}`,
	clonePublic: (token: string) => `/shared/${token}/clone`,
} as const;
