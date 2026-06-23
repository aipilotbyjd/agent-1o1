import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type { IDashboardData, IQuickStats, TDashboardPeriod } from '@/types/dashboard.type';
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
};
