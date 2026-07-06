import { useQuery } from '@tanstack/react-query';
import type { TListParams } from '@/api/core';
import { TriggerCatalogService } from './trigger-catalog.service';
import { triggerCatalogKeys } from './trigger-catalog.keys';

export const useTriggerCatalog = (ws: string, params?: TListParams) =>
	useQuery({
		queryKey: triggerCatalogKeys.list(ws, params),
		queryFn: ({ signal }) => TriggerCatalogService.list(ws, params, signal),
		enabled: !!ws,
	});
