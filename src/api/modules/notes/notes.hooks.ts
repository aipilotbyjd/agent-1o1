import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	INoteFilters,
	ICreateNoteDto,
	IUpdateNoteDto,
	TNoteResourceName,
} from '@/types/note.type';
import { NoteService } from './notes.service';
import { noteKeys } from './notes.keys';

export const useNotes = (
	ws: string,
	resourceId?: string,
	resourceName?: TNoteResourceName,
	filters?: INoteFilters,
) =>
	useQuery({
		queryKey: noteKeys.list(ws, {
			...(filters as unknown as Record<string, unknown>),
			resourceId,
			resourceName,
		}),
		queryFn: ({ signal }) => NoteService.list(ws, resourceId, resourceName, filters, signal),
		enabled: !!ws,
	});

export const useNote = (ws: string, noteId: string) =>
	useQuery({
		queryKey: noteKeys.detail(ws, noteId),
		queryFn: ({ signal }) => NoteService.detail(ws, noteId, signal),
		enabled: !!ws && !!noteId,
	});

export const useCreateNote = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: ICreateNoteDto) => NoteService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: noteKeys.all(ws) });
			notify.success('Note created');
		},
		onError: notify.fromError('Failed to create note'),
	});
};

export const useUpdateNote = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ noteId, body }: { noteId: string; body: IUpdateNoteDto }) =>
			NoteService.update(ws, noteId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: noteKeys.all(ws) });
			notify.success('Note updated');
		},
		onError: notify.fromError('Failed to update note'),
	});
};

export const useDeleteNote = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (noteId: string) => NoteService.remove(ws, noteId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: noteKeys.all(ws) });
			notify.success('Note deleted');
		},
		onError: notify.fromError('Failed to delete note'),
	});
};
