import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { notify } from './notify';
import type { TListParams, TPaginatedResponse } from './types';

/**
 * Factory that generates the 5 standard CRUD hooks for a workspace-scoped resource.
 * Use it for modules that do not need custom hook behavior.
 *
 * Example:
 *   export const Tags = createResource({
 *     service: TagService,
 *     keys   : tagKeys,
 *     label  : { singular: 'Tag', plural: 'Tags' },
 *   });
 *
 *   const { data } = Tags.useList(workspaceId);
 *   const create  = Tags.useCreate(workspaceId);
 */
export function createResource<T, CreateDto, UpdateDto>(cfg: {
	service: {
		list: (
			ws: string,
			params?: TListParams,
			signal?: AbortSignal,
		) => Promise<TPaginatedResponse<T> | T[]>;
		detail: (ws: string, id: string, signal?: AbortSignal) => Promise<T>;
		create: (ws: string, body: CreateDto) => Promise<T>;
		update: (ws: string, id: string, body: UpdateDto) => Promise<T>;
		remove: (ws: string, id: string) => Promise<void>;
	};
	keys: {
		all: (ws: string) => QueryKey;
		list: (ws: string, params?: TListParams) => QueryKey;
		detail: (ws: string, id: string) => QueryKey;
	};
	label: { singular: string; plural: string };
}) {
	const { service, keys, label } = cfg;

	const useList = (ws: string, params?: TListParams) =>
		useQuery({
			queryKey: keys.list(ws, params),
			queryFn: ({ signal }) => service.list(ws, params, signal),
			enabled: !!ws,
		});

	const useDetail = (ws: string, id: string) =>
		useQuery({
			queryKey: keys.detail(ws, id),
			queryFn: ({ signal }) => service.detail(ws, id, signal),
			enabled: !!ws && !!id,
		});

	const useCreate = (ws: string) => {
		const qc = useQueryClient();
		return useMutation({
			mutationFn: (body: CreateDto) => service.create(ws, body),
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: keys.all(ws) });
				notify.success(`${label.singular} created`);
			},
			onError: notify.fromError(`Failed to create ${label.singular.toLowerCase()}`),
		});
	};

	const useUpdate = (ws: string) => {
		const qc = useQueryClient();
		return useMutation({
			mutationFn: ({ id, body }: { id: string; body: UpdateDto }) =>
				service.update(ws, id, body),
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: keys.all(ws) });
				notify.success(`${label.singular} updated`);
			},
			onError: notify.fromError(`Failed to update ${label.singular.toLowerCase()}`),
		});
	};

	const useDelete = (ws: string) => {
		const qc = useQueryClient();
		return useMutation({
			mutationFn: (id: string) => service.remove(ws, id),
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: keys.all(ws) });
				notify.success(`${label.singular} deleted`);
			},
			onError: notify.fromError(`Failed to delete ${label.singular.toLowerCase()}`),
		});
	};

	return { useList, useDetail, useCreate, useUpdate, useDelete };
}
