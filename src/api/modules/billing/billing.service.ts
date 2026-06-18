import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	TBillingCheckoutDto,
	TBillingSwitchDto,
	TBillingSwitchUrlResponse,
	TBuyCreditsDto,
	TBillingUrlResponse,
	TLifetimePlan,
	TSubscription,
} from '@/types/billing.type';
import { BillingEndpoints as E } from './billing.endpoints';

export const BillingService = {
	checkout: (ws: string, body: TBillingCheckoutDto) =>
		axiosClient
			.post<TApiResponse<TBillingSwitchUrlResponse>>(E.checkout(ws), body)
			.then(unwrap<TBillingSwitchUrlResponse>),

	switch: (ws: string, body: TBillingSwitchDto) =>
		axiosClient
			.post<TApiResponse<TBillingSwitchUrlResponse | TSubscription>>(E.switch(ws), body)
			.then(unwrap<TBillingSwitchUrlResponse | TSubscription>),

	lifetimePlans: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TLifetimePlan[]>>(E.lifetimePlans(ws), { signal })
			.then(unwrap<TLifetimePlan[]>),

	buyCredits: (ws: string, body: TBuyCreditsDto) =>
		axiosClient
			.post<TApiResponse<TBillingUrlResponse>>(E.buyCredits(ws), body)
			.then(unwrap<TBillingUrlResponse>),

	portal: (ws: string) =>
		axiosClient
			.get<TApiResponse<TBillingUrlResponse>>(E.portal(ws))
			.then(unwrap<TBillingUrlResponse>),
};
