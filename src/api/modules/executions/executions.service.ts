import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TListParams, TPaginatedResponse } from '@/api/core';
import type { TExecution, TExecutionDetail, TExecutionLog } from '@/types/execution.type';
import { ExecutionEndpoints as E } from './executions.endpoints';

export const ExecutionService = {
	list: (ws: string, params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<TExecution>>(E.list(ws), { params, signal })
			.then((r) => r.data),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TExecutionDetail>>(E.detail(ws, id), { signal })
			.then(unwrap<TExecutionDetail>),

	logs: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TExecutionLog[]>>(E.logs(ws, id), { signal })
			.then(unwrap<TExecutionLog[]>),

	cancel: (ws: string, id: string) => axiosClient.post(E.cancel(ws, id)).then(() => undefined),

	retry: (ws: string, id: string) => axiosClient.post(E.retry(ws, id)).then(() => undefined),

	replay: (ws: string, id: string, body?: { mode?: 'fresh' | 'continue' }) =>
		axiosClient.post<TApiResponse<TExecution>>(E.replay(ws, id), body).then(unwrap<TExecution>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),

	bulkDelete: (ws: string, ids: string[]) =>
		axiosClient.delete(E.bulkDelete(ws), { data: { ids } }).then(() => undefined),

	stats: (ws: string, params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<Record<string, unknown>>>(E.stats(ws), { params, signal })
			.then(unwrap<Record<string, unknown>>),

	compare: (ws: string, ids: string[], signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<unknown>>(E.compare(ws), { params: { ids: ids.join(',') }, signal })
			.then(unwrap<unknown>),

	nodes: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient.get<TApiResponse<unknown>>(E.nodes(ws, id), { signal }).then(unwrap<unknown>),

	streamUrl: (ws: string, id: string) => E.stream(ws, id),

	streamAllUrl: (ws: string) => E.streamAll(ws),
};
