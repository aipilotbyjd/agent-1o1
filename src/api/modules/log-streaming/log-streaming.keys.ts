export const logStreamingKeys = {
	all: (ws: string) => ['log-streaming', ws] as const,
	list: (ws: string) => ['log-streaming', ws, 'list'] as const,
	detail: (ws: string, id: string) => ['log-streaming', ws, 'detail', id] as const,
};
