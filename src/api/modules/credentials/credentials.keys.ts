import type { TListParams } from '@/api/core';

export const credentialKeys = {
	all: (ws?: string) => (ws ? (['credentials', ws] as const) : (['credentials'] as const)),
	list: (ws: string, params?: TListParams) => ['credentials', ws, 'list', params] as const,
	detail: (ws: string, id: string) => ['credentials', ws, 'detail', id] as const,
};

export const oauthKeys = {
	all: () => ['oauth'] as const,
	providers: () => ['oauth', 'providers'] as const,
};
