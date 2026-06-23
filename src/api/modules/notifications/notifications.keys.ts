import type { TListParams } from '@/api/core';

export const notificationKeys = {
	all: () => ['notifications'] as const,
	list: (params?: TListParams) => ['notifications', 'list', params] as const,
	unreadCount: () => ['notifications', 'unread-count'] as const,
};
