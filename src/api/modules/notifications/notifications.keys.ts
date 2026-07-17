import type { TListParams } from '@/api/core';

export const notificationKeys = {
	all: (ws?: string) => (ws ? ['notifications', ws] as const : ['notifications'] as const),
	list: (ws: string, params?: TListParams) => ['notifications', ws, 'list', params] as const,
	unreadCount: (ws: string) => ['notifications', ws, 'unread-count'] as const,
};

