export const TriggerCatalogEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/trigger-catalog`,
} as const;
