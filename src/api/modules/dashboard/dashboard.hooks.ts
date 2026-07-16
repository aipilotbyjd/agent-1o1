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

export const useDashboardSummary = (ws: string, period: TDashboardPeriod = '7d') =>
	useQuery({
		queryKey: dashboardKeys.summary(ws, period),
		queryFn: ({ signal }) => DashboardService.getSummary(ws, period, signal),
		enabled: !!ws,
	});

export const useRecentExecutions = (ws: string, limit = 10) =>
	useQuery({
		queryKey: dashboardKeys.recentExecutions(ws, limit),
		queryFn: ({ signal }) => DashboardService.getRecentExecutions(ws, limit, signal),
		enabled: !!ws,
	});

export const useTopWorkflows = (ws: string, period: TDashboardPeriod = '7d', limit = 10) =>
	useQuery({
		queryKey: dashboardKeys.topWorkflows(ws, period, limit),
		queryFn: ({ signal }) => DashboardService.getTopWorkflows(ws, period, limit, signal),
		enabled: !!ws,
	});

export const useRecentFailures = (ws: string, limit = 10) =>
	useQuery({
		queryKey: dashboardKeys.recentFailures(ws, limit),
		queryFn: ({ signal }) => DashboardService.getRecentFailures(ws, limit, signal),
		enabled: !!ws,
	});

export const useExecutionsByDay = (ws: string, period: TDashboardPeriod = '7d') =>
	useQuery({
		queryKey: dashboardKeys.executionsByDay(ws, period),
		queryFn: ({ signal }) => DashboardService.getExecutionsByDay(ws, period, signal),
		enabled: !!ws,
	});

export const useExecutionsByHour = (ws: string, period: TDashboardPeriod = '7d') =>
	useQuery({
		queryKey: dashboardKeys.executionsByHour(ws, period),
		queryFn: ({ signal }) => DashboardService.getExecutionsByHour(ws, period, signal),
		enabled: !!ws,
	});

export const useExecutionsByStatus = (ws: string, period: TDashboardPeriod = '7d') =>
	useQuery({
		queryKey: dashboardKeys.executionsByStatus(ws, period),
		queryFn: ({ signal }) => DashboardService.getExecutionsByStatus(ws, period, signal),
		enabled: !!ws,
	});

export const useTriggerTypeStats = (ws: string, period: TDashboardPeriod = '7d') =>
	useQuery({
		queryKey: dashboardKeys.triggerTypeStats(ws, period),
		queryFn: ({ signal }) => DashboardService.getTriggerTypeStats(ws, period, signal),
		enabled: !!ws,
	});

export const useUpcomingSchedules = (ws: string, limit = 10) =>
	useQuery({
		queryKey: dashboardKeys.upcomingSchedules(ws, limit),
		queryFn: ({ signal }) => DashboardService.getUpcomingSchedules(ws, limit, signal),
		enabled: !!ws,
	});
