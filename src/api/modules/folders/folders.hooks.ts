import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { ICreateFolderDto, IUpdateFolderDto } from '@/types/folder.type';
import type { IMoveWorkflowsDto } from '@/types/workflow.type';
import { FolderService } from './folders.service';
import { folderKeys } from './folders.keys';
import { workflowKeys } from '../workflows/workflows.keys';

export const useFolders = (ws: string) =>
	useQuery({
		queryKey: folderKeys.list(ws),
		queryFn: ({ signal }) => FolderService.list(ws, signal),
		enabled: !!ws,
	});

export const useFolder = (ws: string, id: string) =>
	useQuery({
		queryKey: folderKeys.detail(ws, id),
		queryFn: ({ signal }) => FolderService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useCreateFolder = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: ICreateFolderDto) => FolderService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: folderKeys.all(ws) });
			notify.success('Folder created');
		},
		onError: notify.fromError('Failed to create folder'),
	});
};

export const useUpdateFolder = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: IUpdateFolderDto }) =>
			FolderService.update(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: folderKeys.all(ws) });
			notify.success('Folder updated');
		},
		onError: notify.fromError('Failed to update folder'),
	});
};

export const useDeleteFolder = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => FolderService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: folderKeys.all(ws) });
			notify.success('Folder deleted');
		},
		onError: notify.fromError('Failed to delete folder'),
	});
};

export const useMoveWorkflows = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: IMoveWorkflowsDto) => FolderService.moveWorkflows(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: folderKeys.all(ws) });
			qc.invalidateQueries({ queryKey: workflowKeys.all(ws) });
			notify.success('Workflows moved');
		},
		onError: notify.fromError('Failed to move workflows'),
	});
};
