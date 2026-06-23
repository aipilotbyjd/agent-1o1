import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { ICreateEnvironmentDto, IUpdateEnvironmentDto } from '@/types/environment.type';
import { EnvironmentService } from './environments.service';
import { environmentKeys } from './environments.keys';

export const useEnvironments = (ws: string) =>
	useQuery({
		queryKey: environmentKeys.list(ws),
		queryFn: ({ signal }) => EnvironmentService.list(ws, signal),
		enabled: !!ws,
	});

export const useEnvironment = (ws: string, id: string) =>
	useQuery({
		queryKey: environmentKeys.detail(ws, id),
		queryFn: ({ signal }) => EnvironmentService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useCreateEnvironment = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: ICreateEnvironmentDto) => EnvironmentService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: environmentKeys.all(ws) });
			notify.success('Environment created');
		},
		onError: notify.fromError('Failed to create environment'),
	});
};

export const useUpdateEnvironment = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: IUpdateEnvironmentDto }) =>
			EnvironmentService.update(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: environmentKeys.all(ws) });
			notify.success('Environment updated');
		},
		onError: notify.fromError('Failed to update environment'),
	});
};

export const useDeleteEnvironment = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => EnvironmentService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: environmentKeys.all(ws) });
			notify.success('Environment deleted');
		},
		onError: notify.fromError('Failed to delete environment'),
	});
};
