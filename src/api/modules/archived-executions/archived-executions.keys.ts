import type { TListParams } from '@/api/core';

export const archivedExecutionKeys = {
	all: (ws: string) => ['archived-executions', ws] as const,
	list: (ws: string, params?: TListParams) =>
		['archived-executions', ws, 'list', params] as const,
	stats: (ws: string, params?: TListParams) =>
		['archived-executions', ws, 'stats', params] as const,
	detail: (ws: string, id: string) => ['archived-executions', ws, 'detail', id] as const,
};
