export const GitSyncEndpoints = {
	status: (ws: string) => `/workspaces/${ws}/git-sync`,
	configure: (ws: string) => `/workspaces/${ws}/git-sync`,
	export: (ws: string) => `/workspaces/${ws}/git-sync/export`,
	import: (ws: string) => `/workspaces/${ws}/git-sync/import`,
} as const;
