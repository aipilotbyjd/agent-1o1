import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse, TListParams } from '@/api/core';
import { ConnectorMetricEndpoints as E } from './connector-metrics.endpoints';

export interface IConnectorMetricFilters extends TListParams {
	connector?: string;
	from?: string;
	to?: string;
}

export interface IConnectorMetric {
	id: string;
	connector: string;
	node_type?: string;
	success_count: number;
	failure_count: number;
	total_count: number;
	avg_duration_ms: number;
	recorded_at: string;
	[key: string]: unknown;
}

export interface IConnectorMetricSummary {
	total_calls: number;
	success_rate: number;
	failure_rate: number;
	avg_duration_ms: number;
	by_connector: Array<{
		connector: string;
		total_count: number;
		success_count: number;
		failure_count: number;
		avg_duration_ms: number;
	}>;
	[key: string]: unknown;
}

export const ConnectorMetricService = {
	list: (ws: string, filters?: IConnectorMetricFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<IConnectorMetric>>(E.list(ws), { params: filters, signal })
			.then((r) => r.data),

	summary: (ws: string, filters?: IConnectorMetricFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IConnectorMetricSummary>>(E.summary(ws), { params: filters, signal })
			.then(unwrap<IConnectorMetricSummary>),
};