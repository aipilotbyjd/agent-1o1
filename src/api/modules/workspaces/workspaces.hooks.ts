import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TListParams } from '@/api/core';
import type { TCreateWorkspaceDto, TUpdateWorkspaceDto } from '@/types/workspace.type';
import { WorkspaceService } from './workspaces.service';
import { workspaceKeys } from './workspaces.keys';
import { authKeys } from '../auth/auth.keys';

export const useWorkspaces = (
	paramsOrOptions?: TListParams | { enabled?: boolean },
	options?: { enabled?: boolean },
) => {
	const hasParams = paramsOrOptions && !('enabled' in paramsOrOptions);
	const params = hasParams ? (paramsOrOptions as TListParams) : undefined;
	const queryOptions = hasParams ? options : (paramsOrOptions as { enabled?: boolean });

	return useQuery({
		queryKey: workspaceKeys.list(params),
		queryFn: ({ signal }) => WorkspaceService.list(params, signal),
		...queryOptions,
	});
};

export const useWorkspace = (id: string) =>
	useQuery({
		queryKey: workspaceKeys.detail(id),
		queryFn: ({ signal }) => WorkspaceService.detail(id, signal),
		enabled: !!id,
	});

export const useCreateWorkspace = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: TCreateWorkspaceDto) => WorkspaceService.create(payload),
		onSuccess: (w) => {
			qc.invalidateQueries({ queryKey: workspaceKeys.all() });
			qc.invalidateQueries({ queryKey: authKeys.user() });
			notify.success(`Workspace "${w.name}" created`);
		},
		onError: notify.fromError('Failed to create workspace'),
	});
};

export const useUpdateWorkspace = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: TUpdateWorkspaceDto }) =>
			WorkspaceService.update(id, body),
		onSuccess: (w) => {
			qc.invalidateQueries({ queryKey: workspaceKeys.all() });
			notify.success(`Workspace "${w.name}" updated`);
		},
		onError: notify.fromError('Failed to update workspace'),
	});
};

export const useDeleteWorkspace = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkspaceService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workspaceKeys.all() });
			notify.success('Workspace deleted');
		},
		onError: notify.fromError('Failed to delete workspace'),
	});
};

export const useLeaveWorkspace = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => WorkspaceService.leave(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workspaceKeys.all() });
			notify.success('Left workspace successfully');
		},
		onError: notify.fromError('Failed to leave workspace'),
	});
};

export const useSwitchWorkspace = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (workspaceId: string) => WorkspaceService.switch(workspaceId),
		onSuccess: (updatedUser) => {
			qc.setQueryData(authKeys.user(), updatedUser);
			qc.invalidateQueries({ queryKey: workspaceKeys.all() });
			notify.success('Workspace switched successfully');
		},
		onError: notify.fromError('Failed to switch workspace'),
	});
};
