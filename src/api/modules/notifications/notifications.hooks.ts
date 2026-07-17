import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TNotificationFilters } from '@/types/notification.type';
import { NotificationService } from './notifications.service';
import { notificationKeys } from './notifications.keys';

export const useNotifications = (ws: string, filters?: TNotificationFilters) =>
	useQuery({
		queryKey: notificationKeys.list(ws, filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => NotificationService.list(ws, filters, signal),
		enabled: !!ws,
	});

export const useUnreadNotificationCount = (ws: string) =>
	useQuery({
		queryKey: notificationKeys.unreadCount(ws),
		queryFn: ({ signal }) => NotificationService.unreadCount(ws, signal),
		enabled: !!ws,
		refetchInterval: 60_000,
	});

export const useMarkNotificationRead = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => NotificationService.markRead(ws, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all(ws) }),
		onError: notify.fromError('Failed to mark as read'),
	});
};

export const useMarkAllNotificationsRead = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => NotificationService.markAllRead(ws),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationKeys.all(ws) });
			notify.success('All notifications marked as read');
		},
		onError: notify.fromError('Failed to mark all as read'),
	});
};

export const useDeleteNotification = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => NotificationService.remove(ws, id),
		onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all(ws) }),
		onError: notify.fromError('Failed to delete notification'),
	});
};

