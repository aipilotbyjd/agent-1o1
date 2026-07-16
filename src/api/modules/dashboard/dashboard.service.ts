import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	IDashboardData,
	IDashboardSummary,
	IDailyExecutions,
	IExecutionSummary,
	IFailureSummary,
	IHourlyExecutions,
	IQuickStats,
	IScheduleSummary,
	IStatusCount,
	ITriggerTypeCount,
	IWorkflowStats,
	TDashboardPeriod,
} from '@/types/dashboard.type';
import { DashboardEndpoints as E } from './dashboard.endpoints';

export const DashboardService = {
	getData: (ws: string, period: TDashboardPeriod = '7d', signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IDashboardData>>(E.data(ws), { params: { period }, signal })
			.then(unwrap<IDashboardData>),

	getStats: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IQuickStats>>(E.stats(ws), { signal })
			.then(unwrap<IQuickStats>),

	getSummary: (ws: string, period: TDashboardPeriod = '7d', signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IDashboardSummary>>(E.summary(ws), { params: { period }, signal })
			.then(unwrap<IDashboardSummary>),

	getRecentExecutions: (ws: string, limit = 10, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IExecutionSummary[]>>(E.recentExecutions(ws), {
				params: { limit },
				signal,
			})
			.then(unwrap<IExecutionSummary[]>),

	getTopWorkflows: (
		ws: string,
		period: TDashboardPeriod = '7d',
		limit = 10,
		signal?: AbortSignal,
	) =>
		axiosClient
			.get<TApiResponse<IWorkflowStats[]>>(E.topWorkflows(ws), {
				params: { period, limit },
				signal,
			})
			.then(unwrap<IWorkflowStats[]>),

	getRecentFailures: (ws: string, limit = 10, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IFailureSummary[]>>(E.recentFailures(ws), {
				params: { limit },
				signal,
			})
			.then(unwrap<IFailureSummary[]>),

	getExecutionsByDay: (ws: string, period: TDashboardPeriod = '7d', signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IDailyExecutions[]>>(E.executionsByDay(ws), {
				params: { period },
				signal,
			})
			.then(unwrap<IDailyExecutions[]>),

	getExecutionsByHour: (ws: string, period: TDashboardPeriod = '7d', signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IHourlyExecutions[]>>(E.executionsByHour(ws), {
				params: { period },
				signal,
			})
			.then(unwrap<IHourlyExecutions[]>),

	getExecutionsByStatus: (ws: string, period: TDashboardPeriod = '7d', signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IStatusCount[]>>(E.executionsByStatus(ws), {
				params: { period },
				signal,
			})
			.then(unwrap<IStatusCount[]>),

	getTriggerTypeStats: (ws: string, period: TDashboardPeriod = '7d', signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<ITriggerTypeCount[]>>(E.triggerTypeStats(ws), {
				params: { period },
				signal,
			})
			.then(unwrap<ITriggerTypeCount[]>),

	getUpcomingSchedules: (ws: string, limit = 10, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IScheduleSummary[]>>(E.upcomingSchedules(ws), {
				params: { limit },
				signal,
			})
			.then(unwrap<IScheduleSummary[]>),
};
