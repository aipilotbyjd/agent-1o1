export const ArtifactEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/artifacts`,
	detail: (ws: string, artifactId: string) => `/workspaces/${ws}/artifacts/${artifactId}`,
	delete: (ws: string, artifactId: string) => `/workspaces/${ws}/artifacts/${artifactId}`,
	download: (ws: string, artifactId: string) => `/workspaces/${ws}/artifacts/${artifactId}/download`,
} as const;
