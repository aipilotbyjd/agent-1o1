import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TMessageResponse } from '@/api/core';
import type {
	TNotificationChannel,
	TCreateNotificationChannelDto,
	TUpdateNotificationChannelDto,
} from '@/types/notification.type';
import { NotificationChannelEndpoints as E } from './notification-channels.endpoints';

export const NotificationChannelService = {
	list: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TNotificationChannel[]>>(E.list(ws), { signal })
			.then(unwrap<TNotificationChannel[]>),

	create: (ws: string, body: TCreateNotificationChannelDto) =>
		axiosClient
			.post<TApiResponse<TNotificationChannel>>(E.create(ws), body)
			.then(unwrap<TNotificationChannel>),

	update: (ws: string, id: string, body: TUpdateNotificationChannelDto) =>
		axiosClient
			.put<TApiResponse<TNotificationChannel>>(E.update(ws, id), body)
			.then(unwrap<TNotificationChannel>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),

	test: (ws: string, id: string) => axiosClient.post<TMessageResponse>(E.test(ws, id)).then((r) => r.data),
};

