import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse } from '@/api/core';
import type { TNotification, TNotificationFilters, TUnreadCount } from '@/types/notification.type';
import { NotificationEndpoints as E } from './notifications.endpoints';

export const NotificationService = {
	list: (filters?: TNotificationFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<TNotification>>(E.list, { params: filters, signal })
			.then((r) => r.data),

	unreadCount: (signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TUnreadCount>>(E.unreadCount, { signal })
			.then(unwrap<TUnreadCount>),

	markRead: (id: string) => axiosClient.post(E.read(id)).then(() => undefined),

	markAllRead: () => axiosClient.post(E.readAll).then(() => undefined),

	remove: (id: string) => axiosClient.delete(E.delete(id)).then(() => undefined),

	removeAll: () => axiosClient.delete(E.deleteAll).then(() => undefined),
};
