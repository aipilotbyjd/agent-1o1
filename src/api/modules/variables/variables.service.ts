import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	IVariable,
	ICreateVariableDto,
	IUpdateVariableDto,
	IResolvedVariable,
	IVariableFilters,
} from '@/types/variable.type';
import { VariableEndpoints as E } from './variables.endpoints';

export const VariableService = {
	list: (ws: string, filters?: IVariableFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IVariable[]>>(E.list(ws), { params: filters, signal })
			.then(unwrap<IVariable[]>),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IVariable>>(E.detail(ws, id), { signal })
			.then(unwrap<IVariable>),

	create: (ws: string, body: ICreateVariableDto) =>
		axiosClient.post<TApiResponse<IVariable>>(E.create(ws), body).then(unwrap<IVariable>),

	update: (ws: string, id: string, body: IUpdateVariableDto) =>
		axiosClient.put<TApiResponse<IVariable>>(E.update(ws, id), body).then(unwrap<IVariable>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),

	resolve: (ws: string, name: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IResolvedVariable>>(E.resolve(ws, name), { signal })
			.then(unwrap<IResolvedVariable>),
};
