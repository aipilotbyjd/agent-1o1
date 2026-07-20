export const artifactKeys = {
	all: (ws: string) => ['artifacts', ws] as const,
	list: (ws: string, filters?: Record<string, unknown>) =>
		['artifacts', ws, 'list', filters ?? {}] as const,
	detail: (ws: string, artifactId: string) => ['artifacts', ws, 'detail', artifactId] as const,
};
