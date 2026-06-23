import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse, TListParams } from '@/api/core';
import type { TExecution } from '@/types/execution.type';
import { ReplayPackEndpoints as E } from './executions.endpoints';

/** A saved snapshot of an execution's data, replayable later. */
export interface IReplayPack {
	id: string;
	execution_id: string;
	workflow_id: string;
	name?: string | null;
	trigger_data?: Record<string, unknown>;
	created_at: string;
}

/**
 * Execution Replay Packs — snapshot an execution's data and replay it later.
 */
export const ReplayPackService = {
	create: (ws: string, executionId: string, body?: { name?: string }) =>
		axiosClient
			.post<TApiResponse<IReplayPack>>(E.create(ws, executionId), body)
			.then(unwrap<IReplayPack>),

	list: (ws: string, params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<IReplayPack>>(E.list(ws), { params, signal })
			.then((r) => r.data),

	replay: (ws: string, replayPackId: string) =>
		axiosClient
			.post<TApiResponse<TExecution>>(E.replay(ws, replayPackId))
			.then(unwrap<TExecution>),
};
