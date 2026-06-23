import { useQuery } from '@tanstack/react-query';
import type { TDashboardPeriod } from '@/types/dashboard.type';
import { DashboardService } from './dashboard.service';
import { dashboardKeys } from './dashboard.keys';

export const useDashboard = (ws: string, period: TDashboardPeriod = '7d') =>
	useQuery({
		queryKey: dashboardKeys.data(ws, period),
		queryFn: ({ signal }) => DashboardService.getData(ws, period, signal),
		enabled: !!ws,
	});

export const useQuickStats = (ws: string) =>
	useQuery({
		queryKey: dashboardKeys.stats(ws),
		queryFn: ({ signal }) => DashboardService.getStats(ws, signal),
		enabled: !!ws,
	});
