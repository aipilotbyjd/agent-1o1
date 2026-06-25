import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	TCreateNotificationChannelDto,
	TUpdateNotificationChannelDto,
} from '@/types/notification.type';
import { NotificationChannelService } from './notification-channels.service';
import { notificationChannelKeys } from './notification-channels.keys';

export const useNotificationChannels = (ws: string) =>
	useQuery({
		queryKey: notificationChannelKeys.list(ws),
		queryFn: ({ signal }) => NotificationChannelService.list(ws, signal),
		enabled: !!ws,
	});

export const useCreateNotificationChannel = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TCreateNotificationChannelDto) =>
			NotificationChannelService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationChannelKeys.all(ws) });
			notify.success('Channel created');
		},
		onError: notify.fromError('Failed to create channel'),
	});
};

export const useUpdateNotificationChannel = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: TUpdateNotificationChannelDto }) =>
			NotificationChannelService.update(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationChannelKeys.all(ws) });
			notify.success('Channel updated');
		},
		onError: notify.fromError('Failed to update channel'),
	});
};

export const useDeleteNotificationChannel = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => NotificationChannelService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationChannelKeys.all(ws) });
			notify.success('Channel deleted');
		},
		onError: notify.fromError('Failed to delete channel'),
	});
};

export const useTestNotificationChannel = (ws: string) =>
	useMutation({
		mutationFn: (id: string) => NotificationChannelService.test(ws, id),
		onSuccess: () => notify.success('Test message sent'),
		onError: notify.fromError('Test failed'),
	});

