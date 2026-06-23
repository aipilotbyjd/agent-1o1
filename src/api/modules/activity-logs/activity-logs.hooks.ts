import { useQuery, useMutation } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TActivityLogFilters, TActivityLogExportFormat } from '@/types/activityLog.type';
import { ActivityLogService } from './activity-logs.service';
import { activityLogKeys } from './activity-logs.keys';

export const useActivityLogs = (ws: string, filters?: TActivityLogFilters) =>
	useQuery({
		queryKey: activityLogKeys.list(ws, filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => ActivityLogService.list(ws, filters, signal),
		enabled: !!ws,
	});

export const useActivityLog = (ws: string, id: string) =>
	useQuery({
		queryKey: activityLogKeys.detail(ws, id),
		queryFn: ({ signal }) => ActivityLogService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useExportActivityLogs = (ws: string) =>
	useMutation({
		mutationFn: ({
			format = 'csv',
			filters,
		}: {
			format?: TActivityLogExportFormat;
			filters?: TActivityLogFilters;
		}) => ActivityLogService.export(ws, format, filters),
		onError: notify.fromError('Failed to export activity logs'),
	});
