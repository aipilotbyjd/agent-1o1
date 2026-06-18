export const WebhookEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/webhooks`,
	create: (ws: string) => `/workspaces/${ws}/webhooks`,
	detail: (ws: string, webhookId: string) => `/workspaces/${ws}/webhooks/${webhookId}`,
	update: (ws: string, webhookId: string) => `/workspaces/${ws}/webhooks/${webhookId}`,
	delete: (ws: string, webhookId: string) => `/workspaces/${ws}/webhooks/${webhookId}`,
	activate: (ws: string, webhookId: string) => `/workspaces/${ws}/webhooks/${webhookId}/activate`,
	deactivate: (ws: string, webhookId: string) =>
		`/workspaces/${ws}/webhooks/${webhookId}/deactivate`,
	test: (ws: string, webhookId: string) => `/workspaces/${ws}/webhooks/${webhookId}/test`,
	logs: (ws: string, webhookId: string) => `/workspaces/${ws}/webhooks/${webhookId}/logs`,
} as const;
