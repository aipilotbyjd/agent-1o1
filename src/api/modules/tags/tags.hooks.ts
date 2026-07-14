import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TListParams } from '@/api/core';
import type { ICreateTagDto, IUpdateTagDto, ITagWorkflowsDto } from '@/types/tag.type';
import { TagService } from './tags.service';
import { tagKeys } from './tags.keys';

export const useTags = (ws: string, params?: TListParams) =>
	useQuery({
		queryKey: tagKeys.list(ws, params),
		queryFn: ({ signal }) => TagService.list(ws, params, signal),
		enabled: !!ws,
	});

export const useTag = (ws: string, id: string) =>
	useQuery({
		queryKey: tagKeys.detail(ws, id),
		queryFn: ({ signal }) => TagService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useCreateTag = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: ICreateTagDto) => TagService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: tagKeys.all(ws) });
			notify.success('Tag created');
		},
		onError: notify.fromError('Failed to create tag'),
	});
};

export const useUpdateTag = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: IUpdateTagDto }) =>
			TagService.update(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: tagKeys.all(ws) });
			notify.success('Tag updated');
		},
		onError: notify.fromError('Failed to update tag'),
	});
};

export const useDeleteTag = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => TagService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: tagKeys.all(ws) });
			notify.success('Tag deleted');
		},
		onError: notify.fromError('Failed to delete tag'),
	});
};

export const useAttachTagWorkflows = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ tagId, body }: { tagId: string; body: ITagWorkflowsDto }) =>
			TagService.attachWorkflows(ws, tagId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: tagKeys.all(ws) });
			notify.success('Workflows attached');
		},
		onError: notify.fromError('Failed to attach workflows'),
	});
};

export const useDetachTagWorkflows = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ tagId, body }: { tagId: string; body: ITagWorkflowsDto }) =>
			TagService.detachWorkflows(ws, tagId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: tagKeys.all(ws) });
			notify.success('Workflows detached');
		},
		onError: notify.fromError('Failed to detach workflows'),
	});
};
