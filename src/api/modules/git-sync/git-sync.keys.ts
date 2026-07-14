export const gitSyncKeys = {
	all: (ws: string) => ['git-sync', ws] as const,
	status: (ws: string) => ['git-sync', ws, 'status'] as const,
};
