export const billingKeys = {
	all: (ws: string) => ['billing', ws] as const,
	portal: (ws: string) => ['billing', ws, 'portal'] as const,
	lifetimePlans: (ws: string) => ['billing', ws, 'lifetime-plans'] as const,
};
