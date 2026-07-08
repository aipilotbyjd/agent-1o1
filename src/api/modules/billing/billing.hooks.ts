import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TBillingCheckoutDto, TBuyCreditsDto, TSubscription } from '@/types/billing.type';
import { BillingService } from './billing.service';
import { billingKeys } from './billing.keys';
import { planKeys } from '../plans/plans.keys';

export const useBillingCheckout = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TBillingCheckoutDto) => BillingService.checkout(ws, body),
		onSuccess: (data) => {
			if ('url' in data) {
				window.location.href = data.url;
			} else {
				qc.setQueryData(planKeys.subscription(ws), data as TSubscription);
				qc.invalidateQueries({ queryKey: planKeys.subscription(ws) });
			}
		},
		onError: notify.fromError('Failed to update subscription'),
	});
};

export const usePackCatalog = (ws: string) =>
	useQuery({
		queryKey: billingKeys.packCatalog(ws),
		queryFn: ({ signal }) => BillingService.packCatalog(ws, signal),
		enabled: !!ws,
		staleTime: 5 * 60_000,
	});

export const useBuyCredits = (ws: string) =>
	useMutation({
		mutationFn: (body: TBuyCreditsDto) => BillingService.buyCredits(ws, body),
		onSuccess: ({ url }) => {
			window.location.href = url;
		},
		onError: notify.fromError('Failed to start credit purchase'),
	});

export const useBillingPortal = (ws: string) =>
	useMutation({
		mutationFn: () => BillingService.portal(ws),
		onSuccess: ({ url }) => {
			window.location.href = url;
		},
		onError: notify.fromError('Failed to open billing portal'),
	});
