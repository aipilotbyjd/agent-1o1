export const DashboardEndpoints = {
	data: (ws: string) => `/workspaces/${ws}/dashboard`,
	stats: (ws: string) => `/workspaces/${ws}/stats`,
} as const;
