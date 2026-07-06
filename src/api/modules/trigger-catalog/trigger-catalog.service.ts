import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TListParams } from '@/api/core';
import { TriggerCatalogEndpoints as E } from './trigger-catalog.endpoints';

export interface ITriggerCatalogEntry {
	key: string;
	name: string;
	description?: string;
	category?: string;
	type?: string;
	icon?: string;
	config_schema?: Record<string, unknown>;
	[key: string]: unknown;
}

export const TriggerCatalogService = {
	list: (ws: string, params?: TListParams, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<ITriggerCatalogEntry[]>>(E.list(ws), { params, signal })
			.then(unwrap<ITriggerCatalogEntry[]>),
};
