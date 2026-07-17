import { useQuery } from '@tanstack/react-query';
import type { TListParams } from '@/api/core';
import { ConnectorMetricService } from './connector-metrics.service';
import type { IConnectorMetricFilters } from './connector-metrics.service';
import { connectorMetricKeys } from './connector-metrics.keys';

export const useConnectorMetrics = (ws: string, filters?: IConnectorMetricFilters) =>
	useQuery({
		queryKey: connectorMetricKeys.list(ws, filters as TListParams),
		queryFn: ({ signal }) => ConnectorMetricService.list(ws, filters, signal),
		enabled: !!ws,
	});

export const useConnectorMetricSummary = (ws: string, filters?: IConnectorMetricFilters) =>
	useQuery({
		queryKey: connectorMetricKeys.summary(ws, filters as TListParams),
		queryFn: ({ signal }) => ConnectorMetricService.summary(ws, filters, signal),
		enabled: !!ws,
	});
