import { useQuery } from '@tanstack/react-query';
import { PlanService } from './plans.service';
import { planKeys } from './plans.keys';

export const usePlans = () =>
	useQuery({
		queryKey: planKeys.list(),
		queryFn: ({ signal }) => PlanService.list(signal),
		staleTime: 5 * 60_000,
	});

export const useSubscription = (ws: string) =>
	useQuery({
		queryKey: planKeys.subscription(ws),
		queryFn: ({ signal }) => PlanService.subscription(ws, signal),
		enabled: !!ws,
		staleTime: 60_000,
	});

export const useUsageSnapshots = (ws: string, params?: { from?: string; to?: string }) =>
	useQuery({
		queryKey: planKeys.usageSnapshots(ws, params as Record<string, string>),
		queryFn: ({ signal }) => PlanService.usageSnapshots(ws, params, signal),
		enabled: !!ws,
		staleTime: 5 * 60_000,
	});
