import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type { TWebhook } from '@/types/webhook.type';
import { WebhookService } from './webhooks.service';
import { webhookKeys } from './webhooks.keys';

export const useWebhooks = (ws: string) =>
	useQuery({
		queryKey: webhookKeys.list(ws),
		queryFn: ({ signal }) => WebhookService.list(ws, signal),
		enabled: !!ws,
	});

export const useWebhook = (ws: string, webhookId: string) =>
	useQuery({
		queryKey: webhookKeys.detail(ws, webhookId),
		queryFn: ({ signal }) => WebhookService.detail(ws, webhookId, signal),
		enabled: !!ws && !!webhookId,
	});

export const useCreateWebhook = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Partial<TWebhook>) => WebhookService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: webhookKeys.all(ws) });
			notify.success('Webhook created');
		},
		onError: notify.fromError('Failed to create webhook'),
	});
};

export const useUpdateWebhook = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ webhookId, body }: { webhookId: string; body: Partial<TWebhook> }) =>
			WebhookService.update(ws, webhookId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: webhookKeys.all(ws) });
			notify.success('Webhook updated');
		},
		onError: notify.fromError('Failed to update webhook'),
	});
};

export const useDeleteWebhook = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (webhookId: string) => WebhookService.remove(ws, webhookId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: webhookKeys.all(ws) });
			notify.success('Webhook deleted');
		},
		onError: notify.fromError('Failed to delete webhook'),
	});
};

export const useActivateWebhook = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (webhookId: string) => WebhookService.activate(ws, webhookId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: webhookKeys.all(ws) });
			notify.success('Webhook activated');
		},
		onError: notify.fromError('Failed to activate webhook'),
	});
};

export const useDeactivateWebhook = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (webhookId: string) => WebhookService.deactivate(ws, webhookId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: webhookKeys.all(ws) });
			notify.success('Webhook deactivated');
		},
		onError: notify.fromError('Failed to deactivate webhook'),
	});
};

export const useTestWebhook = (ws: string) =>
	useMutation({
		mutationFn: ({ webhookId, body }: { webhookId: string; body: unknown }) =>
			WebhookService.test(ws, webhookId, body),
		onSuccess: () => notify.success('Webhook test sent'),
		onError: notify.fromError('Webhook test failed'),
	});

export const useWebhookLogs = (ws: string, webhookId: string) =>
	useQuery({
		queryKey: webhookKeys.logs(ws, webhookId),
		queryFn: ({ signal }) => WebhookService.listLogs(ws, webhookId, signal),
		enabled: !!ws && !!webhookId,
	});
