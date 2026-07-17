import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type { TWebhook, TWebhookLog } from '@/types/webhook.type';
import { WebhookEndpoints as E } from './webhooks.endpoints';

export const WebhookService = {
	list: (ws: string, signal?: AbortSignal) =>
		axiosClient.get<TApiResponse<TWebhook[]>>(E.list(ws), { signal }).then(unwrap<TWebhook[]>),

	create: (ws: string, body: Partial<TWebhook>) =>
		axiosClient.post<TApiResponse<TWebhook>>(E.create(ws), body).then(unwrap<TWebhook>),

	detail: (ws: string, webhookId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TWebhook>>(E.detail(ws, webhookId), { signal })
			.then(unwrap<TWebhook>),

	update: (ws: string, webhookId: string, body: Partial<TWebhook>) =>
		axiosClient
			.put<TApiResponse<TWebhook>>(E.update(ws, webhookId), body)
			.then(unwrap<TWebhook>),

	remove: (ws: string, webhookId: string) =>
		axiosClient.delete(E.delete(ws, webhookId)).then(() => undefined),

	activate: (ws: string, webhookId: string) =>
		axiosClient.post<TApiResponse<TWebhook>>(E.activate(ws, webhookId)).then(unwrap<TWebhook>),

	deactivate: (ws: string, webhookId: string) =>
		axiosClient
			.post<TApiResponse<TWebhook>>(E.deactivate(ws, webhookId))
			.then(unwrap<TWebhook>),

	test: (ws: string, webhookId: string, body?: unknown) =>
		axiosClient
			.post<TApiResponse<{ success: boolean; message?: string }>>(E.test(ws, webhookId), body)
			.then(unwrap<{ success: boolean; message?: string }>),

	listLogs: (ws: string, webhookId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TWebhookLog[]>>(E.logs(ws, webhookId), { signal })
			.then(unwrap<TWebhookLog[]>),
};
