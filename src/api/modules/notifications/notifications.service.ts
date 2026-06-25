import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse } from '@/api/core';
import type { TNotification, TNotificationFilters, TUnreadCount } from '@/types/notification.type';
import { NotificationEndpoints as E } from './notifications.endpoints';

export const NotificationService = {
	list: (ws: string, filters?: TNotificationFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<TNotification>>(E.list(ws), { params: filters, signal })
			.then((r) => r.data),

	unreadCount: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TUnreadCount>>(E.unreadCount(ws), { signal })
			.then(unwrap<TUnreadCount>),

	markRead: (ws: string, id: string) => axiosClient.post(E.read(ws, id)).then(() => undefined),

	markAllRead: (ws: string) => axiosClient.post(E.readAll(ws)).then(() => undefined),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),
};

