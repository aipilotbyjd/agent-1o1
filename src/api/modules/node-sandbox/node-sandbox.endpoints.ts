export const NodeSandboxEndpoints = {
	run: (ws: string) => `/workspaces/${ws}/nodes/sandbox`,
} as const;
