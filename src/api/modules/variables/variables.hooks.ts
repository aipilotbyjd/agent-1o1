import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	IVariableFilters,
	ICreateVariableDto,
	IUpdateVariableDto,
} from '@/types/variable.type';
import { VariableService } from './variables.service';
import { variableKeys } from './variables.keys';

export const useVariables = (ws: string, filters?: IVariableFilters) =>
	useQuery({
		queryKey: variableKeys.list(ws, filters as unknown as Record<string, unknown>),
		queryFn: ({ signal }) => VariableService.list(ws, filters, signal),
		enabled: !!ws,
	});

export const useVariable = (ws: string, id: string) =>
	useQuery({
		queryKey: variableKeys.detail(ws, id),
		queryFn: ({ signal }) => VariableService.detail(ws, id, signal),
		enabled: !!ws && !!id,
	});

export const useResolveVariable = (ws: string, name: string) =>
	useQuery({
		queryKey: variableKeys.resolve(ws, name),
		queryFn: ({ signal }) => VariableService.resolve(ws, name, signal),
		enabled: !!ws && !!name,
	});

export const useCreateVariable = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: ICreateVariableDto) => VariableService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: variableKeys.all(ws) });
			notify.success('Variable created');
		},
		onError: notify.fromError('Failed to create variable'),
	});
};

export const useUpdateVariable = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: IUpdateVariableDto }) =>
			VariableService.update(ws, id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: variableKeys.all(ws) });
			notify.success('Variable updated');
		},
		onError: notify.fromError('Failed to update variable'),
	});
};

export const useDeleteVariable = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => VariableService.remove(ws, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: variableKeys.all(ws) });
			notify.success('Variable deleted');
		},
		onError: notify.fromError('Failed to delete variable'),
	});
};
