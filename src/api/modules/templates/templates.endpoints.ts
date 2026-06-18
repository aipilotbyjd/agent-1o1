export const TemplateEndpoints = {
	list: () => '/templates',
	categories: () => '/templates/categories',
	detail: (id: string) => `/templates/${id}`,
	applyTemplate: (ws: string, id: string) => `/workspaces/${ws}/templates/${id}/use`,
	publishWorkflow: (ws: string, wfId: string) =>
		`/workspaces/${ws}/workflows/${wfId}/publish-as-template`,

	// Agent Templates
	agentList: () => '/agent-templates',
	agentDetail: (id: string) => `/agent-templates/${id}`,
	agentDeploy: (ws: string, id: string) => `/workspaces/${ws}/agent-templates/${id}/deploy`,

	// Collections
	collectionList: () => '/template-collections',
	collectionDetail: (id: string) => `/template-collections/${id}`,
} as const;
