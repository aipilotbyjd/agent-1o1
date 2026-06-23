import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TListParams } from '@/api/core';
import type {
	TWorkspace,
	TWorkspaceDetail,
	TCreateWorkspaceDto,
	TUpdateWorkspaceDto,
	TWorkspacesPaginatedResponse,
} from '@/types/workspace.type';
import type { TUser } from '@/types/auth.type';
import { WorkspaceEndpoints as E } from './workspaces.endpoints';

export const WorkspaceService = {
	list: (params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TWorkspacesPaginatedResponse>(E.list, { params, signal })
			.then((res) => res.data),

	detail: (id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TWorkspaceDetail>>(E.detail(id), { signal })
			.then(unwrap<TWorkspaceDetail>),

	create: (payload: TCreateWorkspaceDto) =>
		axiosClient.post<TApiResponse<TWorkspace>>(E.create, payload).then(unwrap<TWorkspace>),

	update: (id: string, payload: TUpdateWorkspaceDto) =>
		axiosClient
			.put<TApiResponse<TWorkspaceDetail>>(E.update(id), payload)
			.then(unwrap<TWorkspaceDetail>),

	remove: (id: string) => axiosClient.delete(E.delete(id)).then(() => undefined),
	leave: (id: string) => axiosClient.post(E.leave(id)).then(() => undefined),
	switch: (workspaceId: string) =>
		axiosClient
			.put<TApiResponse<TUser>>(E.switch, { workspace_id: workspaceId })
			.then(unwrap<TUser>),
};
