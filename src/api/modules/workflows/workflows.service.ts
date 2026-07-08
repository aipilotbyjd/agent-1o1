import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse, TListParams } from '@/api/core';
import type {
	IWorkflow,
	IWorkflowFilters,
	TCreateWorkflowDto,
	TUpdateWorkflowDto,
	IExecuteWorkflowDto,
	IWorkflowExport,
	IWorkflowImport,
	IDuplicateWorkflowDto,
} from '@/types/workflow.type';
import type { TExecution, TExecuteWorkflowResponse } from '@/types/execution.type';
import { WorkflowEndpoints as E } from './workflows.endpoints';

export const WorkflowService = {
	list: (ws: string, filters?: IWorkflowFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<IWorkflow>>(E.list(ws), { params: filters, signal })
			.then((r) => r.data),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IWorkflow>>(E.detail(ws, id), { signal })
			.then(unwrap<IWorkflow>),

	create: (ws: string, body: TCreateWorkflowDto) =>
		axiosClient.post<TApiResponse<IWorkflow>>(E.create(ws), body).then(unwrap<IWorkflow>),

	update: (ws: string, id: string, body: TUpdateWorkflowDto) =>
		axiosClient.put<TApiResponse<IWorkflow>>(E.update(ws, id), body).then(unwrap<IWorkflow>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),

	execute: (ws: string, id: string, body?: IExecuteWorkflowDto) =>
		axiosClient
			.post<TApiResponse<TExecuteWorkflowResponse>>(E.execute(ws, id), body)
			.then(unwrap<TExecuteWorkflowResponse>),

	activate: (ws: string, id: string) =>
		axiosClient.post<TApiResponse<IWorkflow>>(E.activate(ws, id)).then(unwrap<IWorkflow>),

	deactivate: (ws: string, id: string) =>
		axiosClient.post<TApiResponse<IWorkflow>>(E.deactivate(ws, id)).then(unwrap<IWorkflow>),

	duplicate: (ws: string, id: string, body?: IDuplicateWorkflowDto) =>
		axiosClient
			.post<TApiResponse<IWorkflow>>(E.duplicate(ws, id), body)
			.then(unwrap<IWorkflow>),

	importWorkflow: (ws: string, body: IWorkflowImport) =>
		axiosClient.post<TApiResponse<IWorkflow>>(E.import(ws), body).then(unwrap<IWorkflow>),

	exportWorkflow: (ws: string, id: string) =>
		axiosClient
			.get<TApiResponse<IWorkflowExport>>(E.export(ws, id))
			.then(unwrap<IWorkflowExport>),

	listExecutions: (ws: string, id: string, params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<TExecution>>(E.executions(ws, id), { params, signal })
			.then((r) => r.data),

	toggleFavorite: (ws: string, id: string, is_favorite: boolean) =>
		axiosClient
			.put<TApiResponse<IWorkflow>>(E.update(ws, id), { is_favorite })
			.then(unwrap<IWorkflow>),

	createWebhook: (ws: string, id: string, body?: Record<string, unknown>) =>
		axiosClient
			.post<TApiResponse<unknown>>(E.createWebhook(ws, id), body)
			.then(unwrap<unknown>),

	createPollingTrigger: (ws: string, id: string, body?: Record<string, unknown>) =>
		axiosClient
			.post<TApiResponse<unknown>>(E.createPollingTrigger(ws, id), body)
			.then(unwrap<unknown>),

	availableTriggers: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<unknown>>(E.availableTriggers(ws, id), { signal })
			.then(unwrap<unknown>),

	getTrigger: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<unknown>>(E.getTrigger(ws, id), { signal })
			.then(unwrap<unknown>),

	triggerDetail: (ws: string, id: string, triggerId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<unknown>>(E.triggerDetail(ws, id, triggerId), { signal })
			.then(unwrap<unknown>),

	pauseTrigger: (ws: string, id: string, triggerId: string) =>
		axiosClient
			.post<TApiResponse<unknown>>(E.pauseTrigger(ws, id, triggerId))
			.then(unwrap<unknown>),

	deleteTrigger: (ws: string, id: string, triggerId: string) =>
		axiosClient
			.delete<TApiResponse<unknown>>(E.triggerDetail(ws, id, triggerId))
			.then(unwrap<unknown>),

	resumeTrigger: (ws: string, id: string, triggerId: string) =>
		axiosClient
			.post<TApiResponse<unknown>>(E.resumeTrigger(ws, id, triggerId))
			.then(unwrap<unknown>),
};
