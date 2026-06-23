export const NotificationChannelEndpoints = {
	list: '/notification-channels',
	create: '/notification-channels',
	update: (id: string) => `/notification-channels/${id}`,
	delete: (id: string) => `/notification-channels/${id}`,
	test: (id: string) => `/notification-channels/${id}/test`,
} as const;
