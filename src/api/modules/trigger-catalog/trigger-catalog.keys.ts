import type { TListParams } from '@/api/core';

export const triggerCatalogKeys = {
	all: (ws: string) => ['trigger-catalog', ws] as const,
	list: (ws: string, params?: TListParams) => ['trigger-catalog', ws, 'list', params] as const,
};
