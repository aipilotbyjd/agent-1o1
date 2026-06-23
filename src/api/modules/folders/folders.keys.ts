export const folderKeys = {
	all: (ws: string) => ['folders', ws] as const,
	list: (ws: string) => ['folders', ws, 'list'] as const,
	detail: (ws: string, id: string) => ['folders', ws, 'detail', id] as const,
};
