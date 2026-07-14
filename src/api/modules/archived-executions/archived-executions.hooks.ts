import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TListParams } from '@/api/core';
import { ArchivedExecutionService } from './archived-executions.service';
import { archivedExecutionKeys } from './archived-executions.keys';
import { executionKeys } from '../executions/executions.keys';

export const useArchivedExecutions = (ws: string, params?: TListParams) =>
	useQuery({
		queryKey: archivedExecutionKeys.list(ws, params),
		queryFn: ({ signal }) => ArchivedExecutionService.list(ws, params, signal),
		enabled: !!ws,
	});

export const useArchivedExecutionStats = (ws: string, params?: TListParams) =>
	useQuery({
		queryKey: archivedExecutionKeys.stats(ws, params),
		queryFn: ({ signal }) => ArchivedExecutionService.stats(ws, params, signal),
		enabled: !!ws,
	});

export const useArchivedExecution = (ws: string, id: string) =>
	useQuery({
		queryKey: archivedExecutionKeys.detail(ws, id),
		queryFn: ({ signal }) => ArchivedExecutionService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useDownloadArchivedExecution = (ws: string) =>
	useMutation({
		mutationFn: (id: string) => ArchivedExecutionService.download(ws, id),
		onError: notify.fromError('Failed to download archive'),
	});

export const useRestoreArchivedExecution = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ArchivedExecutionService.restore(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: archivedExecutionKeys.all(ws) });
			qc.invalidateQueries({ queryKey: executionKeys.all(ws) });
			notify.success('Execution restored');
		},
		onError: notify.fromError('Failed to restore execution'),
	});
};
