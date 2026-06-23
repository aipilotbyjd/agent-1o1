export const ActivityLogEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/activity-logs`,
	export: (ws: string) => `/workspaces/${ws}/activity-logs/export`,
	detail: (ws: string, id: string) => `/workspaces/${ws}/activity-logs/${id}`,
} as const;
