import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	IWorkflowNode,
	IWorkflowConnection,
	ITestNodeDto,
	ICloneWorkflowDto,
	ISetPinnedDataDto,
	TStoreWorkflowVersionDto,
} from '@/types/workflow.type';
import { WorkflowEditorService } from './editor.service';
import { workflowKeys } from './workflows.keys';

// ── Versions ─────────────────────────────────────────
export const useWorkflowVersions = (ws: string, id: string) =>
	useQuery({
		queryKey: workflowKeys.versions(ws, id),
		queryFn: ({ signal }) => WorkflowEditorService.listVersions(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useRollbackWorkflowVersion = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, version }: { id: string; version: string }) =>
			WorkflowEditorService.rollbackVersion(ws, id, version),
		onSuccess: (_data, { id }) => {
			qc.invalidateQueries({ queryKey: workflowKeys.detail(ws, id) });
			qc.invalidateQueries({ queryKey: workflowKeys.versions(ws, id) });
			notify.success('Rolled back to previous version');
		},
		onError: notify.fromError('Failed to rollback'),
	});
};

export const useCreateWorkflowVersion = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: TStoreWorkflowVersionDto }) =>
			WorkflowEditorService.createVersion(ws, id, body),
		onSuccess: (version, { id }) => {
			qc.invalidateQueries({ queryKey: workflowKeys.detail(ws, id) });
			qc.invalidateQueries({ queryKey: workflowKeys.versions(ws, id) });
			notify.success(`Saved version ${version.version_number}`);
		},
		onError: notify.fromError('Failed to save workflow version'),
	});
};

export const usePublishWorkflowVersion = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, version }: { id: string; version: string }) =>
			WorkflowEditorService.publishVersion(ws, id, version),
		onSuccess: (_version, { id }) => {
			qc.invalidateQueries({ queryKey: workflowKeys.detail(ws, id) });
			qc.invalidateQueries({ queryKey: workflowKeys.versions(ws, id) });
			notify.success('Workflow version published');
		},
		onError: notify.fromError('Failed to publish workflow version'),
	});
};

export const useCompareWorkflowVersions = (ws: string, id: string, v1: number, v2: number) =>
	useQuery({
		queryKey: workflowKeys.compareVersions(ws, id, v1, v2),
		queryFn: ({ signal }) => WorkflowEditorService.compareVersions(ws, id, v1, v2, signal),
		enabled: !!ws && !!id && !!v1 && !!v2,
	});

// ── Validate / Test Node ─────────────────────────────
export const useValidateWorkflow = (ws: string) =>
	useMutation({
		mutationFn: ({
			nodes,
			connections,
		}: {
			nodes: IWorkflowNode[];
			connections: IWorkflowConnection[];
		}) => WorkflowEditorService.validate(ws, nodes, connections),
		onError: notify.fromError('Validation failed'),
	});

export const useTestNode = (ws: string) =>
	useMutation({
		mutationFn: (body: ITestNodeDto) => WorkflowEditorService.testNode(ws, body),
		onError: notify.fromError('Node test failed'),
	});

// ── Clone ────────────────────────────────────────────
export const useCloneWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: ICloneWorkflowDto }) =>
			WorkflowEditorService.clone(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Workflow cloned');
		},
		onError: notify.fromError('Failed to clone workflow'),
	});
};

// ── Pinned Data ──────────────────────────────────────
export const usePinnedData = (ws: string, id: string) =>
	useQuery({
		queryKey: workflowKeys.pinnedData(ws, id),
		queryFn: ({ signal }) => WorkflowEditorService.listPinnedData(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useSetPinnedData = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: ISetPinnedDataDto }) =>
			WorkflowEditorService.setPinnedData(ws, id, body),
		onSuccess: (_d, { id }) => {
			qc.invalidateQueries({ queryKey: workflowKeys.pinnedData(ws, id) });
		},
		onError: notify.fromError('Failed to pin data'),
	});
};

export const useDeletePinnedData = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, nodeId }: { id: string; nodeId: string }) =>
			WorkflowEditorService.deletePinnedData(ws, id, nodeId),
		onSuccess: (_d, { id }) => {
			qc.invalidateQueries({ queryKey: workflowKeys.pinnedData(ws, id) });
		},
		onError: notify.fromError('Failed to unpin data'),
	});
};
