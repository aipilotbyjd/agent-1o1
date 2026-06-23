import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import { AutofixEndpoints as E } from './executions.endpoints';

/** A single AI-generated fix suggestion for a failed execution. */
export interface IFixSuggestion {
	id: string;
	execution_id: string;
	node_id?: string | null;
	title: string;
	description: string;
	status: 'pending' | 'applied' | 'dismissed';
	confidence?: number;
	patch?: Record<string, unknown> | null;
	created_at: string;
}

/**
 * AI Autofix — diagnose a failed execution and surface/apply fix suggestions.
 * Endpoints live under /executions/{id}/autofix.
 */
export const AutofixService = {
	list: (ws: string, executionId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IFixSuggestion[]>>(E.list(ws, executionId), { signal })
			.then(unwrap<IFixSuggestion[]>),

	diagnose: (ws: string, executionId: string) =>
		axiosClient
			.post<TApiResponse<IFixSuggestion[]>>(E.diagnose(ws, executionId))
			.then(unwrap<IFixSuggestion[]>),

	apply: (ws: string, executionId: string, fixId: string) =>
		axiosClient
			.post<TApiResponse<IFixSuggestion>>(E.apply(ws, executionId, fixId))
			.then(unwrap<IFixSuggestion>),

	dismiss: (ws: string, executionId: string, fixId: string) =>
		axiosClient
			.post<TApiResponse<IFixSuggestion>>(E.dismiss(ws, executionId, fixId))
			.then(unwrap<IFixSuggestion>),
};
