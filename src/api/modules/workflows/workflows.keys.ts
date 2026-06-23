import type { TListParams } from '@/api/core';

export const workflowKeys = {
	all: (ws?: string) => (ws ? (['workflows', ws] as const) : (['workflows'] as const)),
	list: (ws: string, params?: TListParams) => ['workflows', ws, 'list', params] as const,
	detail: (ws: string, id: string) => ['workflows', ws, 'detail', id] as const,
	executions: (ws: string, id: string, params?: TListParams) =>
		['workflows', ws, 'executions', id, params] as const,
	versions: (ws: string, id: string) => ['workflows', ws, 'versions', id] as const,
	compareVersions: (ws: string, id: string, v1: string | number, v2: string | number) =>
		['workflows', ws, 'compareVersions', id, v1, v2] as const,
	nodeOutputSchema: (ws: string, id: string, nodeId: string) =>
		['workflows', ws, 'nodeOutputSchema', id, nodeId] as const,
	pinnedData: (ws: string, id: string) => ['workflows', ws, 'pinnedData', id] as const,
	pinnedDataNode: (ws: string, id: string, nodeId: string) =>
		['workflows', ws, 'pinnedData', id, nodeId] as const,
	shares: (ws: string, workflowId: string) => ['workflows', ws, 'shares', workflowId] as const,
	publicShare: (token: string) => ['publicShares', 'view', token] as const,
	availableTriggers: (ws: string, id: string) =>
		['workflows', ws, 'availableTriggers', id] as const,
	trigger: (ws: string, id: string) => ['workflows', ws, 'trigger', id] as const,
	triggerDetail: (ws: string, id: string, triggerId: string) =>
		['workflows', ws, 'trigger', id, triggerId] as const,
	triggerEvents: (ws: string, triggerId: string) =>
		['workflows', ws, 'triggerEvents', triggerId] as const,
};
