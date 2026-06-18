import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	IEnvironment,
	ICreateEnvironmentDto,
	IUpdateEnvironmentDto,
} from '@/types/environment.type';
import { EnvironmentEndpoints as E } from './environments.endpoints';

export const EnvironmentService = {
	list: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IEnvironment[]>>(E.list(ws), { signal })
			.then(unwrap<IEnvironment[]>),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IEnvironment>>(E.detail(ws, id), { signal })
			.then(unwrap<IEnvironment>),

	create: (ws: string, body: ICreateEnvironmentDto) =>
		axiosClient.post<TApiResponse<IEnvironment>>(E.create(ws), body).then(unwrap<IEnvironment>),

	update: (ws: string, id: string, body: IUpdateEnvironmentDto) =>
		axiosClient
			.put<TApiResponse<IEnvironment>>(E.update(ws, id), body)
			.then(unwrap<IEnvironment>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),
};
