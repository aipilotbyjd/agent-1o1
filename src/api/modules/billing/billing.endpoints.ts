export const BillingEndpoints = {
	checkout: (ws: string) => `/workspaces/${ws}/billing/checkout`,
	switch: (ws: string) => `/workspaces/${ws}/billing/switch`,
	lifetimePlans: (ws: string) => `/workspaces/${ws}/billing/lifetime-plans`,
	buyCredits: (ws: string) => `/workspaces/${ws}/billing/credits`,
	portal: (ws: string) => `/workspaces/${ws}/billing/portal`,
} as const;
