import type { TListParams } from '@/api/core';

export const activityLogKeys = {
	all: (ws: string) => ['activity-logs', ws] as const,
	list: (ws: string, params?: TListParams) => ['activity-logs', ws, 'list', params] as const,
	detail: (ws: string, id: string) => ['activity-logs', ws, 'detail', id] as const,
};
