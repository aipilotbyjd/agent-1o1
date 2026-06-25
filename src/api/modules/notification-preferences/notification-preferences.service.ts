import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	TNotificationPreference,
	TNotificationPreferencesResponse,
	TUpdateNotificationPreferencesDto,
} from '@/types/notification.type';
import { NotificationPreferenceEndpoints as E } from './notification-preferences.endpoints';

export const NotificationPreferenceService = {
	get: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TNotificationPreferencesResponse>>(E.get(ws), { signal })
			.then(unwrap<TNotificationPreferencesResponse>),

	update: (ws: string, body: TUpdateNotificationPreferencesDto) =>
		axiosClient
			.put<TApiResponse<TNotificationPreference[]>>(E.update(ws), body)
			.then(unwrap<TNotificationPreference[]>),
};

