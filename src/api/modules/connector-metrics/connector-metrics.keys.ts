import type { TListParams } from '@/api/core';

export const connectorMetricKeys = {
	all: (ws: string) => ['connector-metrics', ws] as const,
	list: (ws: string, params?: TListParams) => ['connector-metrics', ws, 'list', params] as const,
	summary: (ws: string, params?: TListParams) =>
		['connector-metrics', ws, 'summary', params] as const,
};
