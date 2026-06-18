import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TUpdateNotificationPreferencesDto } from '@/types/notification.type';
import { NotificationPreferenceService } from './notification-preferences.service';
import { notificationPreferenceKeys } from './notification-preferences.keys';

export const useNotificationPreferences = () =>
	useQuery({
		queryKey: notificationPreferenceKeys.all(),
		queryFn: ({ signal }) => NotificationPreferenceService.get(signal),
	});

export const useUpdateNotificationPreferences = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TUpdateNotificationPreferencesDto) =>
			NotificationPreferenceService.update(body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationPreferenceKeys.all() });
			notify.success('Preferences updated');
		},
		onError: notify.fromError('Failed to update preferences'),
	});
};
