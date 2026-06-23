import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	TLogStreamingConfig,
	TCreateLogStreamingConfigDto,
	TUpdateLogStreamingConfigDto,
} from '@/types/logStreaming.type';
import { LogStreamingEndpoints as E } from './log-streaming.endpoints';

export const LogStreamingService = {
	list: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TLogStreamingConfig[]>>(E.list(ws), { signal })
			.then(unwrap<TLogStreamingConfig[]>),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TLogStreamingConfig>>(E.detail(ws, id), { signal })
			.then(unwrap<TLogStreamingConfig>),

	create: (ws: string, body: TCreateLogStreamingConfigDto) =>
		axiosClient
			.post<TApiResponse<TLogStreamingConfig>>(E.create(ws), body)
			.then(unwrap<TLogStreamingConfig>),

	update: (ws: string, id: string, body: TUpdateLogStreamingConfigDto) =>
		axiosClient
			.put<TApiResponse<TLogStreamingConfig>>(E.update(ws, id), body)
			.then(unwrap<TLogStreamingConfig>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),
};
