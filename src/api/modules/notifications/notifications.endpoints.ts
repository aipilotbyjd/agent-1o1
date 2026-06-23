export const NotificationEndpoints = {
	list: '/notifications',
	unreadCount: '/notifications/unread-count',
	readAll: '/notifications/read-all',
	deleteAll: '/notifications',
	read: (id: string) => `/notifications/${id}/read`,
	delete: (id: string) => `/notifications/${id}`,
} as const;
