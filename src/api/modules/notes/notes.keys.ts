import type { TListParams } from '@/api/core';

export const noteKeys = {
	all: (ws: string) => ['notes', ws] as const,
	list: (ws: string, params?: TListParams) => ['notes', ws, 'list', params] as const,
	detail: (ws: string, id: string) => ['notes', ws, 'detail', id] as const,
};
