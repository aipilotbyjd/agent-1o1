export const webhookKeys = {
	all: (ws: string) => ['webhooks', ws] as const,
	list: (ws: string) => ['webhooks', ws, 'list'] as const,
	detail: (ws: string, webhookId: string) => ['webhooks', ws, 'detail', webhookId] as const,
	logs: (ws: string, webhookId: string) => ['webhook-logs', ws, webhookId] as const,
};
