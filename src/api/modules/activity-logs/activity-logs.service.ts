import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse } from '@/api/core';
import type {
	TActivityLog,
	TActivityLogFilters,
	TActivityLogExportFormat,
} from '@/types/activityLog.type';
import { ActivityLogEndpoints as E } from './activity-logs.endpoints';

export const ActivityLogService = {
	list: (ws: string, filters?: TActivityLogFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<TActivityLog>>(E.list(ws), { params: filters, signal })
			.then((r) => r.data),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TActivityLog>>(E.detail(ws, id), { signal })
			.then(unwrap<TActivityLog>),

	export: (ws: string, format: TActivityLogExportFormat = 'csv', filters?: TActivityLogFilters) =>
		axiosClient
			.get<Blob>(E.export(ws), {
				params: { ...filters, format },
				responseType: 'blob',
			})
			.then((r) => r.data),
};
