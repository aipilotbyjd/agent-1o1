import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TListParams } from '@/api/core';
import type { TExecution, TExecutionDetail } from '@/types/execution.type';
import { ArchivedExecutionEndpoints as E } from './archived-executions.endpoints';

export const ArchivedExecutionService = {
	list: (ws: string, params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TExecution[]>>(E.list(ws), { params, signal })
			.then(unwrap<TExecution[]>),

	stats: (ws: string, params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<Record<string, unknown>>>(E.stats(ws), { params, signal })
			.then(unwrap<Record<string, unknown>>),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TExecutionDetail>>(E.detail(ws, id), { signal })
			.then(unwrap<TExecutionDetail>),

	download: (ws: string, id: string) =>
		axiosClient.get<Blob>(E.download(ws, id), { responseType: 'blob' }).then((r) => r.data),

	restore: (ws: string, id: string) =>
		axiosClient.post<TApiResponse<TExecution>>(E.restore(ws, id)).then(unwrap<TExecution>),
};
