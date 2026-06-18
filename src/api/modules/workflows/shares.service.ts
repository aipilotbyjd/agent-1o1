import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type { TWorkflow } from '@/types/workflow.type';
import type {
	IWorkflowShare,
	ICreateShareDto,
	IUpdateShareDto,
	IPublicShareView,
} from '@/types/share.type';
import { WorkflowShareEndpoints as E } from './workflows.endpoints';

export const WorkflowShareService = {
	list: (ws: string, workflowId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IWorkflowShare[]>>(E.list(ws, workflowId), { signal })
			.then(unwrap<IWorkflowShare[]>),

	create: (ws: string, workflowId: string, body: ICreateShareDto) =>
		axiosClient
			.post<TApiResponse<IWorkflowShare>>(E.create(ws, workflowId), body)
			.then(unwrap<IWorkflowShare>),

	update: (ws: string, workflowId: string, shareId: string, body: IUpdateShareDto) =>
		axiosClient
			.put<TApiResponse<IWorkflowShare>>(E.update(ws, workflowId, shareId), body)
			.then(unwrap<IWorkflowShare>),

	remove: (ws: string, workflowId: string, shareId: string) =>
		axiosClient.delete(E.delete(ws, workflowId, shareId)).then(() => undefined),

	viewPublic: (token: string, password?: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IPublicShareView>>(E.viewPublic(token), {
				params: password ? { password } : undefined,
				signal,
			})
			.then(unwrap<IPublicShareView>),

	clonePublic: (ws: string, token: string, password?: string) =>
		axiosClient
			.post<
				TApiResponse<TWorkflow>
			>(E.clonePublic(ws, token), password ? { password } : undefined)
			.then(unwrap<TWorkflow>),
};
