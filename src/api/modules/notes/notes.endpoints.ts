export const NoteEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/sticky-notes`,
	detail: (ws: string, noteId: string) => `/workspaces/${ws}/sticky-notes/${noteId}`,
	create: (ws: string) => `/workspaces/${ws}/sticky-notes`,
	update: (ws: string, noteId: string) => `/workspaces/${ws}/sticky-notes/${noteId}`,
	delete: (ws: string, noteId: string) => `/workspaces/${ws}/sticky-notes/${noteId}`,
} as const;
