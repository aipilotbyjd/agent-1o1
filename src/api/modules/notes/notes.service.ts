import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse } from '@/api/core';
import type {
	INote,
	INoteFilters,
	ICreateNoteDto,
	IUpdateNoteDto,
	TNoteResourceName,
} from '@/types/note.type';
import { NoteEndpoints as E } from './notes.endpoints';

export const NoteService = {
	list: (
		ws: string,
		resourceId?: string,
		resourceName?: TNoteResourceName,
		filters?: INoteFilters,
		signal?: AbortSignal,
	) => {
		const params: Record<string, unknown> = { ...filters };
		if (resourceId) params.resource_id = resourceId;
		if (resourceName) params.resource_name = resourceName;
		return axiosClient
			.get<TPaginatedResponse<INote>>(E.list(ws), { params, signal })
			.then((r) => r.data);
	},

	detail: (ws: string, noteId: string, signal?: AbortSignal) =>
		axiosClient.get<TApiResponse<INote>>(E.detail(ws, noteId), { signal }).then(unwrap<INote>),

	create: (ws: string, body: ICreateNoteDto) =>
		axiosClient.post<TApiResponse<INote>>(E.create(ws), body).then(unwrap<INote>),

	update: (ws: string, noteId: string, body: IUpdateNoteDto) =>
		axiosClient.put<TApiResponse<INote>>(E.update(ws, noteId), body).then(unwrap<INote>),

	remove: (ws: string, noteId: string) =>
		axiosClient.delete(E.delete(ws, noteId)).then(() => undefined),
};
