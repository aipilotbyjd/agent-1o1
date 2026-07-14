import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type { IFolder, ICreateFolderDto, IUpdateFolderDto } from '@/types/folder.type';
import type { IMoveWorkflowsDto } from '@/types/workflow.type';
import { FolderEndpoints as E } from './folders.endpoints';

export const FolderService = {
	list: (ws: string, signal?: AbortSignal) =>
		axiosClient.get<TApiResponse<IFolder[]>>(E.list(ws), { signal }).then(unwrap<IFolder[]>),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient.get<TApiResponse<IFolder>>(E.detail(ws, id), { signal }).then(unwrap<IFolder>),

	create: (ws: string, body: ICreateFolderDto) =>
		axiosClient.post<TApiResponse<IFolder>>(E.create(ws), body).then(unwrap<IFolder>),

	update: (ws: string, id: string, body: IUpdateFolderDto) =>
		axiosClient.put<TApiResponse<IFolder>>(E.update(ws, id), body).then(unwrap<IFolder>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),

	moveWorkflows: (ws: string, body: IMoveWorkflowsDto) =>
		axiosClient.post(E.moveWorkflows(ws), body).then(() => undefined),
};
