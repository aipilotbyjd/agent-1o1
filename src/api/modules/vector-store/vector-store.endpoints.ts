export const VectorStoreEndpoints = {
	ingest: (ws: string) => `/workspaces/${ws}/vector-store/ingest`,
	query: (ws: string) => `/workspaces/${ws}/vector-store/query`,
} as const;
