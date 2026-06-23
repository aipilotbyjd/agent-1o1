import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	INodeType,
	INodeCategory,
	INodeCategoryFilters,
	INodeTypeFilters,
	IRecentlyUsedNodes,
	ICustomNodes,
} from '@/types/nodeType.type';
import { NodeTypeEndpoints as E } from './node-types.endpoints';

export const NodeTypeService = {
	list: (filters?: INodeTypeFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<INodeType[]>>(E.list, { params: filters, signal })
			.then(unwrap<INodeType[]>),

	categories: (filters?: INodeCategoryFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<INodeCategory[]>>(E.categories, { params: filters, signal })
			.then(unwrap<INodeCategory[]>),

	detail: (id: string, workspaceId?: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<INodeType>>(E.detail(id), {
				params: workspaceId ? { workspace_id: workspaceId } : undefined,
				signal,
			})
			.then(unwrap<INodeType>),

	categoryDetail: (id: string, workspaceId?: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<INodeCategory>>(E.categoryDetail(id), {
				params: workspaceId ? { workspace_id: workspaceId } : undefined,
				signal,
			})
			.then(unwrap<INodeCategory>),

	recentlyUsed: (workspaceId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IRecentlyUsedNodes>>(E.recentlyUsed(workspaceId), { signal })
			.then(unwrap<IRecentlyUsedNodes>),

	customNodes: (workspaceId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<ICustomNodes>>(E.customNodes(workspaceId), { signal })
			.then(unwrap<ICustomNodes>),
};
