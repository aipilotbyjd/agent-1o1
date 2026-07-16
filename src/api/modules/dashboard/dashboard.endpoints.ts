export const DashboardEndpoints = {
	data: (ws: string) => `/workspaces/${ws}/dashboard`,
	stats: (ws: string) => `/workspaces/${ws}/stats`,
	summary: (ws: string) => `/workspaces/${ws}/dashboard/summary`,
	recentExecutions: (ws: string) => `/workspaces/${ws}/dashboard/recent-executions`,
	topWorkflows: (ws: string) => `/workspaces/${ws}/dashboard/top-workflows`,
	recentFailures: (ws: string) => `/workspaces/${ws}/dashboard/recent-failures`,
	executionsByDay: (ws: string) => `/workspaces/${ws}/dashboard/executions-by-day`,
	executionsByHour: (ws: string) => `/workspaces/${ws}/dashboard/executions-by-hour`,
	executionsByStatus: (ws: string) => `/workspaces/${ws}/dashboard/executions-by-status`,
	triggerTypeStats: (ws: string) => `/workspaces/${ws}/dashboard/trigger-type-stats`,
	upcomingSchedules: (ws: string) => `/workspaces/${ws}/dashboard/upcoming-schedules`,
} as const;
