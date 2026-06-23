import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	ITemplate,
	ITemplateDetail,
	ITemplateFilters,
	TTemplateCategory,
	IAgentTemplate,
	ITemplateCollection,
} from '@/types/template.type';
import { TemplateEndpoints as E } from './templates.endpoints';
import { MOCK_AGENT_TEMPLATES, MOCK_TEMPLATE_COLLECTIONS } from '@/mocks/templates.mock';

export const TemplateService = {
	list: (filters?: ITemplateFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<ITemplate[]>>(E.list(), { params: filters, signal })
			.then(unwrap<ITemplate[]>),

	detail: (id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<ITemplateDetail>>(E.detail(id), { signal })
			.then(unwrap<ITemplateDetail>),

	categories: (signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TTemplateCategory[]>>(E.categories(), { signal })
			.then(unwrap<TTemplateCategory[]>),

	apply: (ws: string, templateId: string, workflowName?: string) =>
		axiosClient
			.post<
				TApiResponse<{ id: string }>
			>(E.applyTemplate(ws, templateId), workflowName ? { workflow_name: workflowName } : undefined)
			.then((res) => {
				// The API returns the workflow inside "data". Some return "id" or "workflow_id". Let's handle both.
				const data = unwrap<{ id?: string; workflow_id?: string }>(res);
				return { workflow_id: data.id || data.workflow_id || '' };
			}),

	publishWorkflow: (
		ws: string,
		wfId: string,
		payload: {
			category: string;
			tags?: string[];
			instructions?: string;
			is_featured?: boolean;
			sort_order?: number;
		},
	) =>
		axiosClient
			.post<TApiResponse<ITemplate>>(E.publishWorkflow(ws, wfId), payload)
			.then(unwrap<ITemplate>),

	// Agent Templates
	agentList: (filters?: ITemplateFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IAgentTemplate[]>>(E.agentList(), { params: filters, signal })
			.then(unwrap<IAgentTemplate[]>)
			.then((data) => {
				// Fallback to mock data if empty
				const list = data && data.length > 0 ? data : MOCK_AGENT_TEMPLATES;
				return list.filter((item) => {
					if (
						filters?.search &&
						!item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
						!item.description?.toLowerCase().includes(filters.search.toLowerCase())
					) {
						return false;
					}
					if (filters?.category && item.category !== filters.category) {
						return false;
					}
					if (filters?.is_featured && !item.is_featured) {
						return false;
					}
					return true;
				});
			})
			.catch(() => {
				// Fallback to mock data on error too
				return MOCK_AGENT_TEMPLATES.filter((item) => {
					if (
						filters?.search &&
						!item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
						!item.description?.toLowerCase().includes(filters.search.toLowerCase())
					) {
						return false;
					}
					if (filters?.category && item.category !== filters.category) {
						return false;
					}
					if (filters?.is_featured && !item.is_featured) {
						return false;
					}
					return true;
				});
			}),

	agentDetail: (id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IAgentTemplate>>(E.agentDetail(id), { signal })
			.then(unwrap<IAgentTemplate>)
			.catch(() => {
				const found = MOCK_AGENT_TEMPLATES.find((a) => a.id === id);
				if (!found) throw new Error('Agent template not found');
				return found;
			}),

	agentDeploy: (ws: string, id: string) =>
		axiosClient
			.post<TApiResponse<{ id: string; agent_id?: string }>>(E.agentDeploy(ws, id))
			.then((res) => {
				const data = unwrap<{ id: string; agent_id?: string }>(res);
				return { agent_id: data.id || data.agent_id || '' };
			}),

	// Collections
	collectionList: (filters?: ITemplateFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<ITemplateCollection[]>>(E.collectionList(), {
				params: filters,
				signal,
			})
			.then(unwrap<ITemplateCollection[]>)
			.then((data) => {
				const list = data && data.length > 0 ? data : MOCK_TEMPLATE_COLLECTIONS;
				return list.filter((item) => {
					if (
						filters?.search &&
						!item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
						!item.description?.toLowerCase().includes(filters.search.toLowerCase())
					) {
						return false;
					}
					if (filters?.is_featured && !item.is_featured) {
						return false;
					}
					return true;
				});
			})
			.catch(() => {
				return MOCK_TEMPLATE_COLLECTIONS.filter((item) => {
					if (
						filters?.search &&
						!item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
						!item.description?.toLowerCase().includes(filters.search.toLowerCase())
					) {
						return false;
					}
					if (filters?.is_featured && !item.is_featured) {
						return false;
					}
					return true;
				});
			}),

	collectionDetail: (id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<ITemplateCollection>>(E.collectionDetail(id), { signal })
			.then(unwrap<ITemplateCollection>)
			.catch(() => {
				const found = MOCK_TEMPLATE_COLLECTIONS.find((c) => c.id === id);
				if (!found) throw new Error('Collection not found');
				return found;
			}),
};
