export const NotificationPreferenceEndpoints = {
	get: (ws: string) => `/workspaces/${ws}/notification-preferences`,
	update: (ws: string) => `/workspaces/${ws}/notification-preferences`,
} as const;

