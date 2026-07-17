import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TListParams } from '@/api/core';
import { ExecutionService } from './executions.service';
import { executionKeys } from './executions.keys';

export const useExecutions = (ws: string, params?: TListParams) =>
	useQuery({
		queryKey: executionKeys.list(ws, params),
		queryFn: ({ signal }) => ExecutionService.list(ws, params, signal),
		enabled: !!ws,
	});

export const useExecution = (ws: string, id: string) =>
	useQuery({
		queryKey: executionKeys.detail(ws, id),
		queryFn: ({ signal }) => ExecutionService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useExecutionLogs = (ws: string, id: string) =>
	useQuery({
		queryKey: executionKeys.logs(id),
		queryFn: ({ signal }) => ExecutionService.logs(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useCancelExecution = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ExecutionService.cancel(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: executionKeys.all(ws) });
			notify.success('Execution cancelled');
		},
		onError: notify.fromError('Failed to cancel execution'),
	});
};

export const useRetryExecution = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ExecutionService.retry(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: executionKeys.all(ws) });
			notify.success('Execution retry started');
		},
		onError: notify.fromError('Failed to retry execution'),
	});
};

export const useReplayExecution = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body?: { mode?: 'fresh' | 'continue' } }) =>
			ExecutionService.replay(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: executionKeys.all(ws) });
			notify.success('Execution replay started');
		},
		onError: notify.fromError('Failed to replay execution'),
	});
};

export const useDeleteExecution = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ExecutionService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: executionKeys.all(ws) });
			notify.success('Execution deleted');
		},
		onError: notify.fromError('Failed to delete execution'),
	});
};

export const useBulkDeleteExecutions = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (ids: string[]) => ExecutionService.bulkDelete(ws, ids),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: executionKeys.all(ws) });
			notify.success('Executions deleted');
		},
		onError: notify.fromError('Failed to delete executions'),
	});
};

export const useExecutionStats = (ws: string, params?: TListParams) =>
	useQuery({
		queryKey: executionKeys.stats(ws, params),
		queryFn: ({ signal }) => ExecutionService.stats(ws, params, signal),
		enabled: !!ws,
	});

export const useCompareExecutions = (ws: string, ids: string[]) =>
	useQuery({
		queryKey: executionKeys.compare(ws, ids),
		queryFn: ({ signal }) => ExecutionService.compare(ws, ids, signal),
		enabled: !!ws && ids.length > 1,
	});

export const useExecutionNodes = (ws: string, id: string) =>
	useQuery({
		queryKey: executionKeys.nodes(ws, id),
		queryFn: ({ signal }) => ExecutionService.nodes(ws, id, signal),
		enabled: !!ws && !!id,
	});
