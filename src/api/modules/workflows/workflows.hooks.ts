import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TListParams } from '@/api/core';
import type {
	IWorkflowFilters,
	TCreateWorkflowDto,
	TUpdateWorkflowDto,
	IDuplicateWorkflowDto,
	IWorkflowImport,
	IExecuteWorkflowDto,
} from '@/types/workflow.type';
import { WorkflowService } from './workflows.service';
import { workflowKeys } from './workflows.keys';
import { authKeys } from '../auth/auth.keys';

export const useWorkflows = (ws: string, filters?: IWorkflowFilters) =>
	useQuery({
		queryKey: workflowKeys.list(ws, filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => WorkflowService.list(ws, filters, signal),
		enabled: !!ws,
		staleTime: 5 * 60 * 1000,
	});

export const useWorkflow = (ws: string, id: string) =>
	useQuery({
		queryKey: workflowKeys.detail(ws, id),
		queryFn: ({ signal }) => WorkflowService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useWorkflowExecutions = (ws: string, id: string, params?: TListParams) =>
	useQuery({
		queryKey: workflowKeys.executions(ws, id, params),
		queryFn: ({ signal }) => WorkflowService.listExecutions(ws, id, params, signal),
		enabled: !!ws && !!id,
	});

export const useWorkflowAvailableTriggers = (ws: string, id: string) =>
	useQuery({
		queryKey: workflowKeys.availableTriggers(ws, id),
		queryFn: ({ signal }) => WorkflowService.availableTriggers(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useWorkflowTrigger = (ws: string, id: string) =>
	useQuery({
		queryKey: workflowKeys.trigger(ws, id),
		queryFn: ({ signal }) => WorkflowService.getTrigger(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useWorkflowTriggerDetail = (ws: string, id: string, triggerId: string) =>
	useQuery({
		queryKey: workflowKeys.triggerDetail(ws, id, triggerId),
		queryFn: ({ signal }) => WorkflowService.triggerDetail(ws, id, triggerId, signal),
		enabled: !!ws && !!id && !!triggerId,
	});

export const useCreateWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TCreateWorkflowDto) => WorkflowService.create(ws, body),
		onSuccess: (w) => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			qc.invalidateQueries({ queryKey: authKeys.user() });
			notify.success(`Workflow "${w.name}" created`);
		},
		onError: notify.fromError('Failed to create workflow'),
	});
};

export const useUpdateWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: TUpdateWorkflowDto }) =>
			WorkflowService.update(ws, id, body),
		onSuccess: (w) => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success(`Workflow "${w.name}" updated`);
		},
		onError: notify.fromError('Failed to update workflow'),
	});
};

export const useDeleteWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkflowService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Workflow deleted');
		},
		onError: notify.fromError('Failed to delete workflow'),
	});
};

export const useExecuteWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body?: IExecuteWorkflowDto }) =>
			WorkflowService.execute(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Workflow execution started');
		},
		onError: notify.fromError('Failed to execute workflow'),
	});
};

export const useActivateWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkflowService.activate(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			qc.invalidateQueries({ queryKey: authKeys.user() });
			notify.success('Workflow activated');
		},
		onError: notify.fromError('Failed to activate workflow'),
	});
};

export const useDeactivateWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkflowService.deactivate(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Workflow deactivated');
		},
		onError: notify.fromError('Failed to deactivate workflow'),
	});
};

export const useDuplicateWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body?: IDuplicateWorkflowDto }) =>
			WorkflowService.duplicate(ws, id, body),
		onSuccess: (w) => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success(`Workflow duplicated as "${w.name}"`);
		},
		onError: notify.fromError('Failed to duplicate workflow'),
	});
};

export const useImportWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: IWorkflowImport) => WorkflowService.importWorkflow(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Workflow imported');
		},
		onError: notify.fromError('Failed to import workflow'),
	});
};

export const useExportWorkflow = (ws: string) =>
	useMutation({
		mutationFn: (id: string) => WorkflowService.exportWorkflow(ws, id),
		onError: notify.fromError('Failed to export workflow'),
	});

export const useCreateWorkflowWebhook = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body?: Record<string, unknown> }) =>
			WorkflowService.createWebhook(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Webhook trigger created');
		},
		onError: notify.fromError('Failed to create webhook trigger'),
	});
};

export const useCreateWorkflowPollingTrigger = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body?: Record<string, unknown> }) =>
			WorkflowService.createPollingTrigger(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Polling trigger created');
		},
		onError: notify.fromError('Failed to create polling trigger'),
	});
};

export const usePauseWorkflowTrigger = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workflowId, triggerId }: { workflowId: string; triggerId: string }) =>
			WorkflowService.pauseTrigger(ws, workflowId, triggerId),
		onSuccess: (_, { workflowId }) => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			qc.invalidateQueries({ queryKey: workflowKeys.trigger(ws, workflowId) });
			notify.success('Trigger paused successfully');
		},
		onError: notify.fromError('Failed to pause trigger'),
	});
};

export const useToggleFavorite = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, is_favorite }: { id: string; is_favorite: boolean }) =>
			WorkflowService.toggleFavorite(ws, id, is_favorite),
		onSuccess: (w) => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success(
				w.is_favorite
					? `"${w.name}" added to favorites`
					: `"${w.name}" removed from favorites`,
			);
		},
		onError: notify.fromError('Failed to update favorite status'),
	});
};

export const useDeleteWorkflowTrigger = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workflowId, triggerId }: { workflowId: string; triggerId: string }) =>
			WorkflowService.deleteTrigger(ws, workflowId, triggerId),
		onSuccess: (_, { workflowId }) => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			qc.invalidateQueries({ queryKey: workflowKeys.trigger(ws, workflowId) });
			notify.success('Trigger deleted successfully');
		},
		onError: notify.fromError('Failed to delete trigger'),
	});
};

export const useResumeWorkflowTrigger = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workflowId, triggerId }: { workflowId: string; triggerId: string }) =>
			WorkflowService.resumeTrigger(ws, workflowId, triggerId),
		onSuccess: (_, { workflowId }) => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			qc.invalidateQueries({ queryKey: workflowKeys.trigger(ws, workflowId) });
			notify.success('Trigger resumed successfully');
		},
		onError: notify.fromError('Failed to resume trigger'),
	});
};
