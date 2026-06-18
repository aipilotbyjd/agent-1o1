import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { ICreateShareDto, IUpdateShareDto } from '@/types/share.type';
import { WorkflowShareService } from './shares.service';
import { workflowKeys } from './workflows.keys';

export const useWorkflowShares = (ws: string, workflowId: string) =>
	useQuery({
		queryKey: workflowKeys.shares(ws, workflowId),
		queryFn: ({ signal }) => WorkflowShareService.list(ws, workflowId, signal),
		enabled: !!ws && !!workflowId,
	});

export const useCreateWorkflowShare = (ws: string, workflowId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: ICreateShareDto) => WorkflowShareService.create(ws, workflowId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.shares(ws, workflowId) });
			notify.success('Share link created');
		},
		onError: notify.fromError('Failed to create share link'),
	});
};

export const useUpdateWorkflowShare = (ws: string, workflowId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ shareId, body }: { shareId: string; body: IUpdateShareDto }) =>
			WorkflowShareService.update(ws, workflowId, shareId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.shares(ws, workflowId) });
			notify.success('Share link updated');
		},
		onError: notify.fromError('Failed to update share link'),
	});
};

export const useDeleteWorkflowShare = (ws: string, workflowId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (shareId: string) => WorkflowShareService.remove(ws, workflowId, shareId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.shares(ws, workflowId) });
			notify.success('Share link deleted');
		},
		onError: notify.fromError('Failed to delete share link'),
	});
};

export const usePublicShare = (token: string, password?: string) =>
	useQuery({
		queryKey: workflowKeys.publicShare(token),
		queryFn: ({ signal }) => WorkflowShareService.viewPublic(token, password, signal),
		enabled: !!token,
		retry: false,
	});

export const useClonePublicShare = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ token, password }: { token: string; password?: string }) =>
			WorkflowShareService.clonePublic(ws, token, password),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Workflow cloned to your workspace');
		},
		onError: notify.fromError('Failed to clone workflow'),
	});
};
