export const NotificationEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/notifications`,
	unreadCount: (ws: string) => `/workspaces/${ws}/notifications/unread-count`,
	readAll: (ws: string) => `/workspaces/${ws}/notifications/mark-all-read`,
	read: (ws: string, id: string) => `/workspaces/${ws}/notifications/${id}/read`,
	delete: (ws: string, id: string) => `/workspaces/${ws}/notifications/${id}`,
} as const;

