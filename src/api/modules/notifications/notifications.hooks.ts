import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TNotificationFilters } from '@/types/notification.type';
import { NotificationService } from './notifications.service';
import { notificationKeys } from './notifications.keys';

export const useNotifications = (filters?: TNotificationFilters) =>
	useQuery({
		queryKey: notificationKeys.list(filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => NotificationService.list(filters, signal),
	});

export const useUnreadNotificationCount = () =>
	useQuery({
		queryKey: notificationKeys.unreadCount(),
		queryFn: ({ signal }) => NotificationService.unreadCount(signal),
		refetchInterval: 60_000,
	});

export const useMarkNotificationRead = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => NotificationService.markRead(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all() }),
		onError: notify.fromError('Failed to mark as read'),
	});
};

export const useMarkAllNotificationsRead = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => NotificationService.markAllRead(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationKeys.all() });
			notify.success('All notifications marked as read');
		},
		onError: notify.fromError('Failed to mark all as read'),
	});
};

export const useDeleteNotification = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => NotificationService.remove(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all() }),
		onError: notify.fromError('Failed to delete notification'),
	});
};

export const useDeleteAllNotifications = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => NotificationService.removeAll(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: notificationKeys.all() });
			notify.success('All notifications cleared');
		},
		onError: notify.fromError('Failed to clear notifications'),
	});
};
