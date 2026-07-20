export const AgentEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/agents`,
	create: (ws: string) => `/workspaces/${ws}/agents`,
	detail: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}`,
	update: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}`,
	delete: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}`,
	duplicate: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}/duplicate`,
	attachSkill: (ws: string, agentId: string) =>
		`/workspaces/${ws}/agents/${agentId}/skills/attach`,
	detachSkill: (ws: string, agentId: string, skillId: string) =>
		`/workspaces/${ws}/agents/${agentId}/skills/${skillId}`,
	conversations: (ws: string, agentId: string) =>
		`/workspaces/${ws}/agents/${agentId}/conversations`,
	conversationCreate: (ws: string, agentId: string) =>
		`/workspaces/${ws}/agents/${agentId}/conversations`,
	conversationDetail: (ws: string, agentId: string, conversationId: string) =>
		`/workspaces/${ws}/agents/${agentId}/conversations/${conversationId}`,
	conversationDelete: (ws: string, agentId: string, conversationId: string) =>
		`/workspaces/${ws}/agents/${agentId}/conversations/${conversationId}`,
	sendMessage: (ws: string, agentId: string, conversationId: string) =>
		`/workspaces/${ws}/agents/${agentId}/conversations/${conversationId}/messages`,
	triggers: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}/triggers`,
	triggerCreate: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}/triggers`,
	triggerUpdate: (ws: string, agentId: string, triggerId: string) =>
		`/workspaces/${ws}/agents/${agentId}/triggers/${triggerId}`,
	triggerDelete: (ws: string, agentId: string, triggerId: string) =>
		`/workspaces/${ws}/agents/${agentId}/triggers/${triggerId}`,
	triggerFire: (ws: string, agentId: string, triggerId: string) =>
		`/workspaces/${ws}/agents/${agentId}/triggers/${triggerId}/fire`,

	// Poll a queued message request's status (non-WebSocket clients).
	requestStatus: (ws: string, agentId: string, requestId: string) =>
		`/workspaces/${ws}/agents/${agentId}/requests/${requestId}`,

	// Run history & step traces.
	runs: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}/runs`,
	runDetail: (ws: string, agentId: string, runId: string) =>
		`/workspaces/${ws}/agents/${agentId}/runs/${runId}`,

	// Usage analytics.
	analytics: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}/analytics`,

	// Knowledge base (RAG grounding).
	knowledge: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}/knowledge`,
	knowledgeCreate: (ws: string, agentId: string) =>
		`/workspaces/${ws}/agents/${agentId}/knowledge`,
	knowledgeDetail: (ws: string, agentId: string, knowledgeId: string) =>
		`/workspaces/${ws}/agents/${agentId}/knowledge/${knowledgeId}`,
	knowledgeUpdate: (ws: string, agentId: string, knowledgeId: string) =>
		`/workspaces/${ws}/agents/${agentId}/knowledge/${knowledgeId}`,
	knowledgeDelete: (ws: string, agentId: string, knowledgeId: string) =>
		`/workspaces/${ws}/agents/${agentId}/knowledge/${knowledgeId}`,

	// Persistent memory.
	memories: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}/memories`,
	memoryCreate: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}/memories`,
	memoriesClear: (ws: string, agentId: string) => `/workspaces/${ws}/agents/${agentId}/memories`,
	memoryDelete: (ws: string, agentId: string, memoryId: string) =>
		`/workspaces/${ws}/agents/${agentId}/memories/${memoryId}`,

	// Builder metadata — providers, models, tool catalog, categories, trigger types.
	metaProviders: (ws: string) => `/workspaces/${ws}/agents/meta/providers`,
	metaModels: (ws: string) => `/workspaces/${ws}/agents/meta/models`,
	metaTools: (ws: string) => `/workspaces/${ws}/agents/meta/tools`,
	metaCategories: (ws: string) => `/workspaces/${ws}/agents/meta/categories`,
	metaTriggerTypes: (ws: string) => `/workspaces/${ws}/agents/meta/trigger-types`,
} as const;

export const AgentSkillEndpoints = {
	list: (ws: string) => `/workspaces/${ws}/agent-skills`,
	create: (ws: string) => `/workspaces/${ws}/agent-skills`,
	generate: (ws: string) => `/workspaces/${ws}/agent-skills/generate`,
	detail: (ws: string, skillId: string) => `/workspaces/${ws}/agent-skills/${skillId}`,
	update: (ws: string, skillId: string) => `/workspaces/${ws}/agent-skills/${skillId}`,
	delete: (ws: string, skillId: string) => `/workspaces/${ws}/agent-skills/${skillId}`,
	addReference: (ws: string, skillId: string) =>
		`/workspaces/${ws}/agent-skills/${skillId}/references`,
	updateReference: (ws: string, skillId: string, referenceId: string) =>
		`/workspaces/${ws}/agent-skills/${skillId}/references/${referenceId}`,
	removeReference: (ws: string, skillId: string, referenceId: string) =>
		`/workspaces/${ws}/agent-skills/${skillId}/references/${referenceId}`,
	addScript: (ws: string, skillId: string) => `/workspaces/${ws}/agent-skills/${skillId}/scripts`,
	updateScript: (ws: string, skillId: string, scriptId: string) =>
		`/workspaces/${ws}/agent-skills/${skillId}/scripts/${scriptId}`,
	removeScript: (ws: string, skillId: string, scriptId: string) =>
		`/workspaces/${ws}/agent-skills/${skillId}/scripts/${scriptId}`,
} as const;
