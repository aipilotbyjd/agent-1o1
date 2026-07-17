import type { IListSessionsParams, IListMessagesParams, IListVersionsParams } from '@/types/workflowBuilder.type';

export const workflowBuilderKeys = {
	all: (ws?: string) =>
		ws ? (['workflow-builder', ws] as const) : (['workflow-builder'] as const),
	sessions: (ws: string, params?: IListSessionsParams) =>
		['workflow-builder', ws, 'sessions', params] as const,
	session: (ws: string, id: string) => ['workflow-builder', ws, 'session', id] as const,
	messages: (ws: string, id: string, params?: IListMessagesParams) =>
		['workflow-builder', ws, 'session', id, 'messages', params] as const,
	versions: (ws: string, id: string, params?: IListVersionsParams) =>
		['workflow-builder', ws, 'session', id, 'versions', params] as const,
};
