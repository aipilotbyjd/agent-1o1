export const environmentKeys = {
	all: (ws: string) => ['environments', ws] as const,
	list: (ws: string) => ['environments', ws, 'list'] as const,
	detail: (ws: string, id: string) => ['environments', ws, 'detail', id] as const,
};
