export const ConnectorMetricEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/connector-metrics`,
	summary: (ws: string) => `/workspaces/${ws}/connector-metrics/summary`,
} as const;
