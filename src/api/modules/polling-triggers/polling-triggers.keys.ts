export const pollingTriggerKeys = {
	all: (ws: string) => ['polling-triggers', ws] as const,
	list: (ws: string) => ['polling-triggers', ws, 'list'] as const,
	detail: (ws: string, id: string) => ['polling-triggers', ws, 'detail', id] as const,
};
