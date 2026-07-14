import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse, TListParams } from '@/api/core';
import type { TExecution } from '@/types/execution.type';
import { TriggerEventEndpoints as E } from './workflows.endpoints';

/** A past event received by a trigger (webhook payload, poll result, etc.). */
export interface ITriggerEvent {
	id: string;
	trigger_id: string;
	payload: Record<string, unknown>;
	execution_id?: string | null;
	status?: string;
	created_at: string;
}

/**
 * Trigger Event History — list past events for a trigger and replay them
 * through the workflow (useful for debugging).
 */
export const TriggerEventService = {
	list: (ws: string, triggerId: string, params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<ITriggerEvent>>(E.list(ws, triggerId), { params, signal })
			.then((r) => r.data),

	replay: (ws: string, triggerId: string, eventId: string) =>
		axiosClient
			.post<TApiResponse<TExecution>>(E.replay(ws, triggerId, eventId))
			.then(unwrap<TExecution>),
};
