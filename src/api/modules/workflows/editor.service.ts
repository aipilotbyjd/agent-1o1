import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse } from '@/api/core';
import type {
	IWorkflow,
	IWorkflowVersion,
	IWorkflowVersionComparison,
	IWorkflowValidationResult,
	ITestNodeDto,
	ITestNodeResult,
	ICloneWorkflowDto,
	IWorkflowNode,
	IWorkflowConnection,
	IWorkflowPinnedData,
	ISetPinnedDataDto,
	TStoreWorkflowVersionDto,
} from '@/types/workflow.type';
import { WorkflowEditorEndpoints as E, WorkflowEndpoints } from './workflows.endpoints';

/**
 * Workflow editor-specific operations:
 * versions, pinned-data, and build workflow.
 * Standard CRUD + execute/activate/deactivate/duplicate live in workflows.service.ts.
 */
export const WorkflowEditorService = {
	build: (ws: string, nodes: IWorkflowNode[], connections: IWorkflowConnection[]) =>
		axiosClient
			.post<TApiResponse<IWorkflowValidationResult>>(E.build(ws), { nodes, connections })
			.then(unwrap<IWorkflowValidationResult>),

	validate: (ws: string, nodes: IWorkflowNode[], connections: IWorkflowConnection[]) =>
		WorkflowEditorService.build(ws, nodes, connections),

	testNode: (ws: string, body: ITestNodeDto) =>
		axiosClient
			.post<TApiResponse<ITestNodeResult>>(E.testNode(ws), body)
			.then(unwrap<ITestNodeResult>),

	clone: (ws: string, id: string, body: ICloneWorkflowDto) =>
		axiosClient.post<TApiResponse<IWorkflow>>(E.clone(ws, id), body).then(unwrap<IWorkflow>),

	listVersions: (ws: string, workflowId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<IWorkflowVersion>>(E.versions(ws, workflowId), { signal })
			.then((r) => r.data.data),

	createVersion: (ws: string, workflowId: string, body: TStoreWorkflowVersionDto) =>
		axiosClient
			.put<TApiResponse<IWorkflow>>(WorkflowEndpoints.update(ws, workflowId), body)
			.then(unwrap<IWorkflow>)
			.then<IWorkflowVersion>((wf) => ({
				id: wf.current_version_id ?? '',
				workflow_id: wf.id,
				version_number: wf.version ?? 0,
				name: body.name ?? null,
				description: body.description ?? null,
				nodes: body.nodes,
				edges: body.edges,
				viewport: body.viewport ?? null,
				settings: body.settings ?? wf.settings ?? {},
				change_summary: body.change_summary ?? null,
				is_published: false,
				created_at: wf.updated_at,
			})),

	publishVersion: (ws: string, id: string, version: string) =>
		axiosClient
			.post<TApiResponse<IWorkflowVersion>>(E.publish(ws, id, version))
			.then(unwrap<IWorkflowVersion>),

	rollbackVersion: (ws: string, id: string, version: string) =>
		axiosClient
			.post<TApiResponse<IWorkflowVersion>>(E.rollback(ws, id, version))
			.then(unwrap<IWorkflowVersion>),

	compareVersions: (
		ws: string,
		id: string,
		from: string | number,
		to: string | number,
		signal?: AbortSignal,
	) =>
		axiosClient
			.get<TApiResponse<IWorkflowVersionComparison>>(E.compareVersions(ws, id, from, to), {
				signal,
			})
			.then(unwrap<IWorkflowVersionComparison>),

	getNodeOutputSchema: (ws: string, id: string, nodeId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<Record<string, unknown>>>(E.nodeOutputSchema(ws, id, nodeId), { signal })
			.then(unwrap<Record<string, unknown>>),

	listPinnedData: (ws: string, workflowId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IWorkflowPinnedData[]>>(E.pinnedDataList(ws, workflowId), { signal })
			.then(unwrap<IWorkflowPinnedData[]>),

	setPinnedData: (ws: string, id: string, body: ISetPinnedDataDto) =>
		axiosClient
			.post<TApiResponse<IWorkflowPinnedData>>(E.pinnedDataCreate(ws, id), body)
			.then(unwrap<IWorkflowPinnedData>),

	deletePinnedData: (ws: string, id: string, pinnedDataId: string) =>
		axiosClient.delete(E.pinnedDataDelete(ws, id, pinnedDataId)).then(() => undefined),
};
