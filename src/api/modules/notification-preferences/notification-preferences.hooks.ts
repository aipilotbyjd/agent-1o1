import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TUpdateNotificationPreferencesDto } from '@/types/notification.type';
import { NotificationPreferenceService } from './notification-preferences.service';
import { notificationPreferenceKeys } from './notification-preferences.keys';

export const useNotificationPreferences = (ws: string) =>
	useQuery({
		queryKey: notificationPreferenceKeys.all(ws),
		queryFn: ({ signal }) => NotificationPreferenceService.get(ws, signal),
		enabled: !!ws,
	});

export const useUpdateNotificationPreferences = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TUpdateNotificationPreferencesDto) =>
			NotificationPreferenceService.update(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationPreferenceKeys.all(ws) });
			notify.success('Preferences updated');
		},
		onError: notify.fromError('Failed to update preferences'),
	});
};

