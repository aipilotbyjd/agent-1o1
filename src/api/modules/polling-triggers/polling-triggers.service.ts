import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type { TPollingTrigger, TUpdatePollingTriggerDto } from '@/types/pollingTrigger.type';
import { PollingTriggerEndpoints as E } from './polling-triggers.endpoints';

export const PollingTriggerService = {
	list: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TPollingTrigger[]>>(E.list(ws), { signal })
			.then(unwrap<TPollingTrigger[]>),

	detail: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TPollingTrigger>>(E.detail(ws, id), { signal })
			.then(unwrap<TPollingTrigger>),

	update: (ws: string, id: string, body: TUpdatePollingTriggerDto) =>
		axiosClient
			.put<TApiResponse<TPollingTrigger>>(E.update(ws, id), body)
			.then(unwrap<TPollingTrigger>),

	remove: (ws: string, id: string) => axiosClient.delete(E.delete(ws, id)).then(() => undefined),
};
