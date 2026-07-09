export const BillingEndpoints = {
	checkout: (ws: string) => `/workspaces/${ws}/subscription/checkout`,
	packCatalog: (ws: string) => `/workspaces/${ws}/billing/packs`,
	buyCredits: (ws: string) => `/workspaces/${ws}/billing/packs`,
	portal: (ws: string) => `/workspaces/${ws}/subscription/portal`,
} as const;
