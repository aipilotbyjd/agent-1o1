import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse, TListParams } from '@/api/core';
import type { ITag, ICreateTagDto, IUpdateTagDto, ITagWorkflowsDto } from '@/types/tag.type';
import { TagEndpoints as E } from './tags.endpoints';

export const TagService = {
	list: (ws: string, params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<ITag>>(E.list(ws), { params, signal })
			.then((r) => r.data),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient.get<TApiResponse<ITag>>(E.detail(ws, id), { signal }).then(unwrap<ITag>),

	create: (ws: string, body: ICreateTagDto) =>
		axiosClient.post<TApiResponse<ITag>>(E.create(ws), body).then(unwrap<ITag>),

	update: (ws: string, id: string, body: IUpdateTagDto) =>
		axiosClient.put<TApiResponse<ITag>>(E.update(ws, id), body).then(unwrap<ITag>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),

	attachWorkflows: (ws: string, tagId: string, body: ITagWorkflowsDto) =>
		axiosClient.post<TApiResponse<ITag>>(E.attachWorkflows(ws, tagId), body).then(unwrap<ITag>),

	detachWorkflows: (ws: string, tagId: string, body: ITagWorkflowsDto) =>
		axiosClient
			.delete<TApiResponse<ITag>>(E.detachWorkflows(ws, tagId), { data: body })
			.then(unwrap<ITag>),
};
