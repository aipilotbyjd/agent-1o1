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
	list: (signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TNotificationChannel[]>>(E.list, { signal })
			.then(unwrap<TNotificationChannel[]>),

	create: (body: TCreateNotificationChannelDto) =>
		axiosClient
			.post<TApiResponse<TNotificationChannel>>(E.create, body)
			.then(unwrap<TNotificationChannel>),

	update: (id: string, body: TUpdateNotificationChannelDto) =>
		axiosClient
			.put<TApiResponse<TNotificationChannel>>(E.update(id), body)
			.then(unwrap<TNotificationChannel>),

	remove: (id: string) => axiosClient.delete(E.delete(id)).then(() => undefined),

	test: (id: string) => axiosClient.post<TMessageResponse>(E.test(id)).then((r) => r.data),
};
