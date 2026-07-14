export const dashboardKeys = {
	all: (ws: string) => ['dashboard', ws] as const,
	data: (ws: string, period: string) => ['dashboard', ws, 'data', period] as const,
	stats: (ws: string) => ['dashboard', ws, 'stats'] as const,
};
