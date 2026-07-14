import type { TListParams } from '@/api/core';

export const nodeTypeKeys = {
	all: () => ['nodeTypes'] as const,
	list: (params?: TListParams) => ['nodeTypes', 'list', params] as const,
	categories: (params?: TListParams) => ['nodeTypes', 'categories', params] as const,
	categoryDetail: (id: string, workspaceId?: string) =>
		['nodeTypes', 'categories', 'detail', id, workspaceId] as const,
	detail: (id: string, workspaceId?: string) => ['nodeTypes', 'detail', id, workspaceId] as const,
	recentlyUsed: (workspaceId: string) => ['nodeTypes', 'recentlyUsed', workspaceId] as const,
	customNodes: (workspaceId: string) => ['nodeTypes', 'customNodes', workspaceId] as const,
};
