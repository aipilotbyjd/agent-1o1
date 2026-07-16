export const dashboardKeys = {
	all: (ws: string) => ['dashboard', ws] as const,
	data: (ws: string, period: string) => ['dashboard', ws, 'data', period] as const,
	stats: (ws: string) => ['dashboard', ws, 'stats'] as const,
	summary: (ws: string, period: string) => ['dashboard', ws, 'summary', period] as const,
	recentExecutions: (ws: string, limit: number) =>
		['dashboard', ws, 'recent-executions', limit] as const,
	topWorkflows: (ws: string, period: string, limit: number) =>
		['dashboard', ws, 'top-workflows', period, limit] as const,
	recentFailures: (ws: string, limit: number) =>
		['dashboard', ws, 'recent-failures', limit] as const,
	executionsByDay: (ws: string, period: string) =>
		['dashboard', ws, 'executions-by-day', period] as const,
	executionsByHour: (ws: string, period: string) =>
		['dashboard', ws, 'executions-by-hour', period] as const,
	executionsByStatus: (ws: string, period: string) =>
		['dashboard', ws, 'executions-by-status', period] as const,
	triggerTypeStats: (ws: string, period: string) =>
		['dashboard', ws, 'trigger-type-stats', period] as const,
	upcomingSchedules: (ws: string, limit: number) =>
		['dashboard', ws, 'upcoming-schedules', limit] as const,
};
