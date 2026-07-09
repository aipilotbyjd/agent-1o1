export const TemplateEndpoints = {
	list: () => '/workflow-templates',
	detail: (id: string) => `/workflow-templates/${id}`,
	applyTemplate: (ws: string, id: string) => `/workspaces/${ws}/workflow-templates/${id}/deploy`,
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
