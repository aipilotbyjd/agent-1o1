export const agentKeys = {
	all: (ws: string) => ['agents', ws] as const,
	list: (ws: string) => ['agents', ws, 'list'] as const,
	detail: (ws: string, agentId: string) => ['agents', ws, 'detail', agentId] as const,
	conversations: (ws: string, agentId: string) =>
		['agents', ws, agentId, 'conversations'] as const,
	conversation: (ws: string, agentId: string, conversationId: string) =>
		['agents', ws, agentId, 'conversations', conversationId] as const,
	triggers: (ws: string, agentId: string) => ['agents', ws, agentId, 'triggers'] as const,
	messageRequest: (ws: string, agentId: string, requestId: string) =>
		['agents', ws, agentId, 'requests', requestId] as const,
	runs: (ws: string, agentId: string, filters?: Record<string, unknown>) =>
		['agents', ws, agentId, 'runs', filters ?? {}] as const,
	run: (ws: string, agentId: string, runId: string) =>
		['agents', ws, agentId, 'runs', runId] as const,
	analytics: (ws: string, agentId: string, filters?: Record<string, unknown>) =>
		['agents', ws, agentId, 'analytics', filters ?? {}] as const,
	knowledge: (ws: string, agentId: string, filters?: Record<string, unknown>) =>
		['agents', ws, agentId, 'knowledge', filters ?? {}] as const,
	knowledgeItem: (ws: string, agentId: string, knowledgeId: string) =>
		['agents', ws, agentId, 'knowledge', 'item', knowledgeId] as const,
	memories: (ws: string, agentId: string, scope?: string) =>
		['agents', ws, agentId, 'memories', scope ?? 'all'] as const,
	meta: (ws: string, kind: string, arg?: string) =>
		['agents', ws, 'meta', kind, arg ?? ''] as const,
};

export const agentSkillKeys = {
	all: (ws: string) => ['agent-skills', ws] as const,
	list: (ws: string, filters?: Record<string, unknown>) =>
		['agent-skills', ws, 'list', filters ?? {}] as const,
	detail: (ws: string, skillId: string) => ['agent-skills', ws, 'detail', skillId] as const,
};
