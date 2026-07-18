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

export type TAgentSkill = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
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
