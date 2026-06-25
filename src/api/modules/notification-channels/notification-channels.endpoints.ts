export const NotificationChannelEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/notification-channels`,
	create: (ws: string) => `/workspaces/${ws}/notification-channels`,
	update: (ws: string, id: string) => `/workspaces/${ws}/notification-channels/${id}`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/notification-channels/${id}`,
	test: (ws: string, id: string) => `/workspaces/${ws}/notification-channels/${id}/test`,
} as const;

