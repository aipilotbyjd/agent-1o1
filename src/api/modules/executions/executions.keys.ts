import type { TListParams } from '@/api/core';

export const executionKeys = {
	all: (ws?: string) => (ws ? (['executions', ws] as const) : (['executions'] as const)),
	list: (ws: string, params?: TListParams) => ['executions', ws, 'list', params] as const,
	detail: (ws: string, id: string) => ['executions', ws, 'detail', id] as const,
	logs: (id: string) => ['executions', 'logs', id] as const,
	nodes: (ws: string, id: string) => ['executions', ws, 'nodes', id] as const,
	stats: (ws: string, params?: TListParams) => ['executions', ws, 'stats', params] as const,
	compare: (ws: string, ids: string[]) => ['executions', ws, 'compare', ...ids] as const,
};
