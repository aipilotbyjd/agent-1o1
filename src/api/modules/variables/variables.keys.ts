import type { TListParams } from '@/api/core';

export const variableKeys = {
	all: (ws?: string) => (ws ? (['variables', ws] as const) : (['variables'] as const)),
	list: (ws: string, params?: TListParams) => ['variables', ws, 'list', params] as const,
	detail: (ws: string, id: string) => ['variables', ws, 'detail', id] as const,
	resolve: (ws: string, name: string) => ['variables', ws, 'resolve', name] as const,
};
