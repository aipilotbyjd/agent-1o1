import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	TBillingCheckoutDto,
	TBillingSwitchUrlResponse,
	TBuyCreditsDto,
	TBillingUrlResponse,
	TCreditPackCatalogItem,
	TSubscription,
} from '@/types/billing.type';
import { BillingEndpoints as E } from './billing.endpoints';

export const BillingService = {
	checkout: (ws: string, body: TBillingCheckoutDto) =>
		axiosClient
			.post<TApiResponse<TBillingSwitchUrlResponse | TSubscription>>(E.checkout(ws), body)
			.then(unwrap<TBillingSwitchUrlResponse | TSubscription>),

	packCatalog: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TCreditPackCatalogItem[]>>(E.packCatalog(ws), { signal })
			.then(unwrap<TCreditPackCatalogItem[]>),

	buyCredits: (ws: string, body: TBuyCreditsDto) =>
		axiosClient
			.post<TApiResponse<TBillingUrlResponse>>(E.buyCredits(ws), body)
			.then(unwrap<TBillingUrlResponse>),

	portal: (ws: string) =>
		axiosClient
			.get<TApiResponse<TBillingUrlResponse>>(E.portal(ws))
			.then(unwrap<TBillingUrlResponse>),
};
