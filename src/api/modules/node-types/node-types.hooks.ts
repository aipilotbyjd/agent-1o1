import { useQuery } from '@tanstack/react-query';
import type { INodeCategoryFilters, INodeTypeFilters } from '@/types/nodeType.type';
import { NodeTypeService } from './node-types.service';
import { nodeTypeKeys } from './node-types.keys';

export const useNodes = (filters?: INodeTypeFilters, enabled = true) =>
	useQuery({
		queryKey: nodeTypeKeys.list(filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => NodeTypeService.list(filters, signal),
		enabled,
	});

export const useNodeCategories = (filters?: INodeCategoryFilters) =>
	useQuery({
		queryKey: nodeTypeKeys.categories(filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => NodeTypeService.categories(filters, signal),
	});

export const useNodeCategory = (id: string, workspaceId?: string) =>
	useQuery({
		queryKey: nodeTypeKeys.categoryDetail(id, workspaceId),
		queryFn: ({ signal }) => NodeTypeService.categoryDetail(id, workspaceId, signal),
		enabled: !!id,
	});

export const useNode = (id: string, workspaceId?: string) =>
	useQuery({
		queryKey: nodeTypeKeys.detail(id, workspaceId),
		queryFn: ({ signal }) => NodeTypeService.detail(id, workspaceId, signal),
		enabled: !!id,
	});

export const useRecentlyUsedNodes = (workspaceId: string) =>
	useQuery({
		queryKey: nodeTypeKeys.recentlyUsed(workspaceId),
		queryFn: ({ signal }) => NodeTypeService.recentlyUsed(workspaceId, signal),
		enabled: !!workspaceId,
	});

export const useCustomNodes = (workspaceId: string) =>
	useQuery({
		queryKey: nodeTypeKeys.customNodes(workspaceId),
		queryFn: ({ signal }) => NodeTypeService.customNodes(workspaceId, signal),
		enabled: !!workspaceId,
	});
