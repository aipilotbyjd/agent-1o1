export type TAgentToolConfig = {
	id: string;
	node_type: string;
	tool_name?: string | null;
	tool_description?: string | null;
	is_enabled: boolean;
	sort_order: number;
};

export type TAgent = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	instructions: string;
	model: string;
	provider: string;
	max_steps: number;
	timeout_seconds: number;
	is_active: boolean;
	category?: string | null;
	metadata?: Record<string, unknown> | null;
	default_workflow_id?: string | null;
	skills_count?: number;
	conversations_count?: number;
	skills?: TAgentSkill[];
	tool_configs?: TAgentToolConfig[];
	triggers?: TAgentTrigger[];
	created_at: string;
	updated_at: string;
};

export type TAgentSkillReference = {
	id: string;
	title: string;
	content: string;
	sort_order: number;
};

export type TAgentSkillScript = {
	id: string;
	name: string;
	description: string;
	language: 'php' | 'javascript';
	code: string;
	is_enabled: boolean;
	created_at: string;
	updated_at: string;
};

export type TAgentSkillCategory =
	| 'General'
	| 'Research'
	| 'Data'
	| 'Communication'
	| 'Automation'
	| 'Development'
	| 'Content';

export type TAgentSkill = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	category?: TAgentSkillCategory | string | null;
	icon?: string | null;
	color?: string | null;
	tags?: string[] | null;
	instructions: string;
	is_shared: boolean;
	version: number;
	sort_order?: number;
	references?: TAgentSkillReference[];
	scripts?: TAgentSkillScript[];
	references_count?: number;
	scripts_count?: number;
	created_at: string;
	updated_at: string;
};

export type TSkillFilters = {
	search?: string;
	category?: string;
	is_shared?: boolean;
};

export type TGenerateSkillDto = {
	prompt: string;
};

export type TGeneratedSkillDraft = {
	name: string;
	description: string | null;
	category: string;
	instructions: string;
};

/** What the conversation `store` / `sendMessage` endpoints now return — the turn is queued, not resolved yet. */
export type TAgentMessageQueued = {
	request_id: string;
};

/** Streamed while ProcessAgentMessageJob runs, over the `agent.stream.{request_id}` private channel. */
export type TAgentStreamTextDelta = {
	id: string;
	invocation_id: string;
	type: 'text_delta';
	message_id: string;
	delta: string;
	timestamp: string;
};

export type TAgentStreamToolCall = {
	id: string;
	invocation_id: string;
	type: 'tool_call';
	tool_id: string;
	tool_name: string;
	arguments: Record<string, unknown>;
	reasoning_id: string | null;
	timestamp: string;
};

export type TAgentStreamToolResult = {
	id: string;
	invocation_id: string;
	type: 'tool_result';
	tool_id: string;
	tool_name: string;
	result: unknown;
	successful: boolean;
	error: string | null;
	timestamp: string;
};

/** Terminal event on the same channel — mirrors AgentMessageReady::broadcastWith(). */
export type TAgentMessageReadyEvent = {
	conversation_id: string | null;
	response: string;
	agent_id: string;
	error: boolean;
	error_message: string | null;
};

export type TAgentMessage = {
	id: string;
	role: 'user' | 'assistant' | 'system' | 'tool';
	content: string;
	created_at: string;
};

/** Shape returned by conversation `index` / `show`. */
export type TAgentConversation = {
	id: string;
	title: string | null;
	agent_id: string;
	user_id: number;
	messages?: TAgentMessage[];
	created_at: string;
	updated_at: string;
};

export type TSendAgentMessageDto = {
	message: string;
};

export type TAgentTriggerType = 'schedule' | 'webhook' | 'event';

export type TAgentTrigger = {
	id: string;
	agent_id: string;
	type: TAgentTriggerType;
	config: Record<string, unknown> | null;
	initial_message?: string | null;
	is_active: boolean;
	webhook_url?: string;
	last_fired_at?: string | null;
	created_at: string;
	updated_at: string;
};

export type TAgentSortBy = 'name' | 'created_at' | 'updated_at' | 'conversations_count';
export type TSortOrder = 'asc' | 'desc';

// ─────────────────────────────────────────────────────────────
// Message request polling — non-WebSocket fallback for a queued turn.
// GET {agent}/requests/{requestId} — see AgentMessageRequestResource.
// ─────────────────────────────────────────────────────────────
export type TAgentMessageRequestStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type TAgentMessageRequest = {
	request_id: string;
	status: TAgentMessageRequestStatus;
	conversation_id: string | null;
	agent_run_id: string | null;
	created_at: string;
	updated_at: string;
};

// ─────────────────────────────────────────────────────────────
// Run history & step traces — GET {agent}/runs, GET {agent}/runs/{run}.
// See AgentRunResource / AiAgentStepResource.
// ─────────────────────────────────────────────────────────────
export type TAgentRunSource = 'conversation' | 'trigger' | 'manual' | string;
export type TAgentRunStatus = 'pending' | 'running' | 'completed' | 'failed' | string;

export type TAiAgentStep = {
	id: string;
	step_number: number;
	action: string | null;
	tool_name: string | null;
	tool_input: Record<string, unknown> | null;
	tool_output: unknown;
	llm_reasoning: string | null;
	tokens_used: number | null;
	duration_ms: number | null;
	created_at: string;
};

export type TAgentRun = {
	id: string;
	agent_id: string;
	conversation_id: string | null;
	trigger_id: string | null;
	source: TAgentRunSource;
	status: TAgentRunStatus;
	input: unknown;
	output: unknown;
	error: string | null;
	provider: string | null;
	model: string | null;
	prompt_tokens: number | null;
	completion_tokens: number | null;
	total_tokens: number | null;
	duration_ms: number | null;
	metadata: Record<string, unknown> | null;
	started_at: string | null;
	finished_at: string | null;
	steps_count?: number;
	steps?: TAiAgentStep[];
	created_at: string;
};

export type TAgentRunsFilters = {
	status?: TAgentRunStatus;
	source?: TAgentRunSource;
	per_page?: number;
	page?: number;
};

// ─────────────────────────────────────────────────────────────
// Usage analytics — GET {agent}/analytics.
// See AgentAnalyticsController::show().
// ─────────────────────────────────────────────────────────────
export type TAgentAnalyticsDay = {
	day: string;
	runs: number;
	tokens: number;
	failed: number;
};

export type TAgentAnalytics = {
	range: { from: string; to: string };
	totals: {
		total_runs: number;
		completed: number;
		failed: number;
		running: number;
		success_rate: number | null;
	};
	tokens: {
		total: number;
		prompt: number;
		completion: number;
		avg_per_run: number;
	};
	latency: {
		avg_duration_ms: number;
		max_duration_ms: number;
	};
	by_source: Record<string, number>;
	by_day: TAgentAnalyticsDay[];
};

export type TAgentAnalyticsFilters = {
	from?: string;
	to?: string;
};

// ─────────────────────────────────────────────────────────────
// Knowledge base (RAG grounding) — {agent}/knowledge CRUD.
// See AgentKnowledgeResource / Store|UpdateAgentKnowledgeRequest.
// ─────────────────────────────────────────────────────────────
export type TAgentKnowledgeSourceType = 'text' | 'file' | 'url';

export type TAgentKnowledge = {
	id: string;
	agent_id: string;
	title: string;
	content: string;
	source_type: TAgentKnowledgeSourceType;
	source_url: string | null;
	file_path: string | null;
	tokens: number;
	is_active: boolean;
	sort_order: number;
	metadata: Record<string, unknown> | null;
	created_at: string;
	updated_at: string;
};

export type TCreateAgentKnowledgeDto = {
	title: string;
	content: string;
	source_type?: TAgentKnowledgeSourceType;
	source_url?: string | null;
	file_path?: string | null;
	is_active?: boolean;
	sort_order?: number;
	metadata?: Record<string, unknown> | null;
};

export type TUpdateAgentKnowledgeDto = Partial<TCreateAgentKnowledgeDto>;

export type TAgentKnowledgeFilters = {
	is_active?: boolean;
	search?: string;
	per_page?: number;
	page?: number;
};

// ─────────────────────────────────────────────────────────────
// Persistent memory — {agent}/memories.
// See AgentMemoryResource / StoreAgentMemoryRequest.
// ─────────────────────────────────────────────────────────────
export type TAgentMemoryScope = 'agent' | 'user';

export type TAgentMemory = {
	id: string;
	agent_id: string;
	user_id: number | null;
	key: string;
	value: string;
	type: string;
	metadata: Record<string, unknown> | null;
	created_at: string;
	updated_at: string;
};

export type TCreateAgentMemoryDto = {
	key: string;
	value: string;
	type?: string;
	scope?: TAgentMemoryScope;
	metadata?: Record<string, unknown> | null;
};

// ─────────────────────────────────────────────────────────────
// Builder metadata — agents/meta/* discovery catalogs.
// See AgentMetadataService.
// ─────────────────────────────────────────────────────────────
export type TAgentMetaProvider = {
	value: string;
	label: string;
	driver: string;
	has_models: boolean;
};

export type TAgentMetaModelGroup = {
	provider: string;
	models: string[];
};

export type TAgentMetaTool = {
	node_type: string;
	name: string;
	description: string | null;
	icon: string | null;
	color: string | null;
	credential_type: string | null;
	input_schema: Record<string, unknown> | null;
	is_premium: boolean;
};

export type TAgentMetaCategory = {
	value: string;
	label: string;
};

export type TAgentMetaTriggerType = {
	value?: string;
	label?: string;
	[key: string]: unknown;
};
