import type { TListParams } from '@/api/core';

export const tagKeys = {
	all: (ws: string) => ['tags', ws] as const,
	list: (ws: string, params?: TListParams) => ['tags', ws, 'list', params] as const,
	detail: (ws: string, id: string) => ['tags', ws, 'detail', id] as const,
};
