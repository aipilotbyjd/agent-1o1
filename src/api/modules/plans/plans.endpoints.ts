export const PlanEndpoints = {
	list: () => `/plans`,
	subscription: (ws: string) => `/workspaces/${ws}/subscription`,
	usageSnapshots: (ws: string) => `/workspaces/${ws}/usage-snapshots`,
} as const;
