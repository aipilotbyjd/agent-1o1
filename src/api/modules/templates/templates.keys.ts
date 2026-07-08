import type { TListParams } from '@/api/core';

export const templateKeys = {
	all: () => ['templates'] as const,
	list: (params?: TListParams) => ['templates', 'list', params] as const,
	detail: (id: string) => ['templates', 'detail', id] as const,

	agentList: (params?: TListParams) => ['templates', 'agentList', params] as const,
	agentDetail: (id: string) => ['templates', 'agentDetail', id] as const,

	collectionList: (params?: TListParams) => ['templates', 'collectionList', params] as const,
	collectionDetail: (id: string) => ['templates', 'collectionDetail', id] as const,
};
