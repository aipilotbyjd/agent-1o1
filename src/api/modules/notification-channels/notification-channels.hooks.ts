import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	TCreateNotificationChannelDto,
	TUpdateNotificationChannelDto,
} from '@/types/notification.type';
import { NotificationChannelService } from './notification-channels.service';
import { notificationChannelKeys } from './notification-channels.keys';

export const useNotificationChannels = () =>
	useQuery({
		queryKey: notificationChannelKeys.list(),
		queryFn: ({ signal }) => NotificationChannelService.list(signal),
	});

export const useCreateNotificationChannel = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TCreateNotificationChannelDto) =>
			NotificationChannelService.create(body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationChannelKeys.all() });
			notify.success('Channel created');
		},
		onError: notify.fromError('Failed to create channel'),
	});
};

export const useUpdateNotificationChannel = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: TUpdateNotificationChannelDto }) =>
			NotificationChannelService.update(id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationChannelKeys.all() });
			notify.success('Channel updated');
		},
		onError: notify.fromError('Failed to update channel'),
	});
};

export const useDeleteNotificationChannel = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => NotificationChannelService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationChannelKeys.all() });
			notify.success('Channel deleted');
		},
		onError: notify.fromError('Failed to delete channel'),
	});
};

export const useTestNotificationChannel = () =>
	useMutation({
		mutationFn: (id: string) => NotificationChannelService.test(id),
		onSuccess: () => notify.success('Test message sent'),
		onError: notify.fromError('Test failed'),
	});
