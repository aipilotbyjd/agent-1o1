const base = (ws: string) => `/workspaces/${ws}/workflow-builder`;

export const WorkflowBuilderEndpoints = {
	// ── One-shot generation (no session) ──────────────
	generate: (ws: string) => base(ws),
	explain: (ws: string) => `${base(ws)}/explain`,
	suggestNodes: (ws: string) => `${base(ws)}/suggest-nodes`,
	configureNode: (ws: string) => `${base(ws)}/configure-node`,
	suggestEnhancements: (ws: string) => `${base(ws)}/suggest-enhancements`,

	// ── Sessions ──────────────────────────────────────
	sessions: (ws: string) => `${base(ws)}/sessions`,
	sessionCreate: (ws: string) => `${base(ws)}/sessions`,
	session: (ws: string, id: string) => `${base(ws)}/sessions/${id}`,
	sessionUpdate: (ws: string, id: string) => `${base(ws)}/sessions/${id}`,
	sessionDelete: (ws: string, id: string) => `${base(ws)}/sessions/${id}`,
	sessionValidate: (ws: string, id: string) => `${base(ws)}/sessions/${id}/validate`,
	sessionSave: (ws: string, id: string) => `${base(ws)}/sessions/${id}/save`,

	// ── Messages ──────────────────────────────────────
	messages: (ws: string, id: string) => `${base(ws)}/sessions/${id}/messages`,
	messageCreate: (ws: string, id: string) => `${base(ws)}/sessions/${id}/messages`,

	// ── Draft versions ────────────────────────────────
	versions: (ws: string, id: string) => `${base(ws)}/sessions/${id}/versions`,
	versionRestore: (ws: string, id: string, versionId: string) =>
		`${base(ws)}/sessions/${id}/versions/${versionId}/restore`,
} as const;
