import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse } from '@/api/core';
import type {
	TAgent,
	TAgentSkill,
	TAgentConversation,
	TAgentMessageQueued,
	TSendAgentMessageDto,
	TAgentTrigger,
	TAgentSkillReference,
	TAgentSkillScript,
	TSkillFilters,
	TGenerateSkillDto,
	TGeneratedSkillDraft,
	TAgentMessageRequest,
	TAgentRun,
	TAgentRunsFilters,
	TAgentAnalytics,
	TAgentAnalyticsFilters,
	TAgentKnowledge,
	TAgentKnowledgeFilters,
	TCreateAgentKnowledgeDto,
	TUpdateAgentKnowledgeDto,
	TAgentMemory,
	TAgentMemoryScope,
	TCreateAgentMemoryDto,
	TAgentMetaProvider,
	TAgentMetaModelGroup,
	TAgentMetaTool,
	TAgentMetaCategory,
	TAgentMetaTriggerType,
} from '@/types/agent.type';
import { AgentEndpoints as E, AgentSkillEndpoints as S } from './agents.endpoints';

export const AgentService = {
	list: (ws: string, signal?: AbortSignal) =>
		axiosClient.get<TApiResponse<TAgent[]>>(E.list(ws), { signal }).then(unwrap<TAgent[]>),

	detail: (ws: string, agentId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgent>>(E.detail(ws, agentId), { signal })
			.then(unwrap<TAgent>),

	create: (ws: string, body: Partial<TAgent>) =>
		axiosClient.post<TApiResponse<TAgent>>(E.create(ws), body).then(unwrap<TAgent>),

	update: (ws: string, agentId: string, body: Partial<TAgent>) =>
		axiosClient.put<TApiResponse<TAgent>>(E.update(ws, agentId), body).then(unwrap<TAgent>),

	remove: (ws: string, agentId: string) =>
		axiosClient.delete(E.delete(ws, agentId)).then(() => undefined),

	duplicate: (ws: string, agentId: string) =>
		axiosClient.post<TApiResponse<TAgent>>(E.duplicate(ws, agentId)).then(unwrap<TAgent>),

	attachSkill: (ws: string, agentId: string, skillId: string) =>
		axiosClient.post(E.attachSkill(ws, agentId), { skill_id: skillId }).then(() => undefined),

	detachSkill: (ws: string, agentId: string, skillId: string) =>
		axiosClient.delete(E.detachSkill(ws, agentId, skillId)).then(() => undefined),

	listConversations: (ws: string, agentId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentConversation[]>>(E.conversations(ws, agentId), { signal })
			.then(unwrap<TAgentConversation[]>),

	/** Queues a conversation's first message — reply streams live over `agent.stream.{request_id}`. */
	createConversation: (ws: string, agentId: string, body: TSendAgentMessageDto) =>
		axiosClient
			.post<TApiResponse<TAgentMessageQueued>>(E.conversationCreate(ws, agentId), body)
			.then(unwrap<TAgentMessageQueued>),

	conversationDetail: (ws: string, agentId: string, conversationId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentConversation>>(E.conversationDetail(ws, agentId, conversationId), { signal })
			.then(unwrap<TAgentConversation>),

	deleteConversation: (ws: string, agentId: string, conversationId: string) =>
		axiosClient.delete(E.conversationDelete(ws, agentId, conversationId)).then(() => undefined),

	/** Queues the next message in an existing conversation — reply streams live over `agent.stream.{request_id}`. */
	sendMessage: (
		ws: string,
		agentId: string,
		conversationId: string,
		body: TSendAgentMessageDto,
	) =>
		axiosClient
			.post<
				TApiResponse<TAgentMessageQueued>
			>(E.sendMessage(ws, agentId, conversationId), body)
			.then(unwrap<TAgentMessageQueued>),

	listTriggers: (ws: string, agentId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentTrigger[]>>(E.triggers(ws, agentId), { signal })
			.then(unwrap<TAgentTrigger[]>),

	createTrigger: (ws: string, agentId: string, body: Partial<TAgentTrigger>) =>
		axiosClient
			.post<TApiResponse<TAgentTrigger>>(E.triggerCreate(ws, agentId), body)
			.then(unwrap<TAgentTrigger>),

	updateTrigger: (ws: string, agentId: string, triggerId: string, body: Partial<TAgentTrigger>) =>
		axiosClient
			.put<TApiResponse<TAgentTrigger>>(E.triggerUpdate(ws, agentId, triggerId), body)
			.then(unwrap<TAgentTrigger>),

	deleteTrigger: (ws: string, agentId: string, triggerId: string) =>
		axiosClient.delete(E.triggerDelete(ws, agentId, triggerId)).then(() => undefined),

	fireTrigger: (ws: string, agentId: string, triggerId: string, body?: Record<string, unknown>) =>
		axiosClient
			.post<TApiResponse<unknown>>(E.triggerFire(ws, agentId, triggerId), body)
			.then(unwrap<unknown>),

	// ── Message request polling (WebSocket fallback) ──────────
	/** Polls a queued turn's status — pending/processing/completed/failed + resolved ids. */
	requestStatus: (ws: string, agentId: string, requestId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentMessageRequest>>(E.requestStatus(ws, agentId, requestId), { signal })
			.then(unwrap<TAgentMessageRequest>),

	// ── Run history & step traces ─────────────────────────────
	listRuns: (ws: string, agentId: string, filters?: TAgentRunsFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<TAgentRun>>(E.runs(ws, agentId), { params: filters, signal })
			.then((r) => r.data),

	runDetail: (ws: string, agentId: string, runId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentRun>>(E.runDetail(ws, agentId, runId), { signal })
			.then(unwrap<TAgentRun>),

	// ── Usage analytics ───────────────────────────────────────
	analytics: (
		ws: string,
		agentId: string,
		filters?: TAgentAnalyticsFilters,
		signal?: AbortSignal,
	) =>
		axiosClient
			.get<TApiResponse<TAgentAnalytics>>(E.analytics(ws, agentId), { params: filters, signal })
			.then(unwrap<TAgentAnalytics>),

	// ── Knowledge base (RAG grounding) ────────────────────────
	listKnowledge: (
		ws: string,
		agentId: string,
		filters?: TAgentKnowledgeFilters,
		signal?: AbortSignal,
	) =>
		axiosClient
			.get<TPaginatedResponse<TAgentKnowledge>>(E.knowledge(ws, agentId), {
				params: filters,
				signal,
			})
			.then((r) => r.data),

	knowledgeDetail: (ws: string, agentId: string, knowledgeId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentKnowledge>>(E.knowledgeDetail(ws, agentId, knowledgeId), { signal })
			.then(unwrap<TAgentKnowledge>),

	createKnowledge: (ws: string, agentId: string, body: TCreateAgentKnowledgeDto) =>
		axiosClient
			.post<TApiResponse<TAgentKnowledge>>(E.knowledgeCreate(ws, agentId), body)
			.then(unwrap<TAgentKnowledge>),

	updateKnowledge: (
		ws: string,
		agentId: string,
		knowledgeId: string,
		body: TUpdateAgentKnowledgeDto,
	) =>
		axiosClient
			.put<
				TApiResponse<TAgentKnowledge>
			>(E.knowledgeUpdate(ws, agentId, knowledgeId), body)
			.then(unwrap<TAgentKnowledge>),

	deleteKnowledge: (ws: string, agentId: string, knowledgeId: string) =>
		axiosClient.delete(E.knowledgeDelete(ws, agentId, knowledgeId)).then(() => undefined),

	// ── Persistent memory ─────────────────────────────────────
	listMemories: (ws: string, agentId: string, scope?: TAgentMemoryScope, signal?: AbortSignal) =>
		axiosClient
			.get<
				TApiResponse<TAgentMemory[]>
			>(E.memories(ws, agentId), { params: scope ? { scope } : undefined, signal })
			.then(unwrap<TAgentMemory[]>),

	createMemory: (ws: string, agentId: string, body: TCreateAgentMemoryDto) =>
		axiosClient
			.post<TApiResponse<TAgentMemory>>(E.memoryCreate(ws, agentId), body)
			.then(unwrap<TAgentMemory>),

	deleteMemory: (ws: string, agentId: string, memoryId: string) =>
		axiosClient.delete(E.memoryDelete(ws, agentId, memoryId)).then(() => undefined),

	clearMemories: (ws: string, agentId: string, scope?: TAgentMemoryScope) =>
		axiosClient
			.delete(E.memoriesClear(ws, agentId), { params: scope ? { scope } : undefined })
			.then(() => undefined),

	// ── Builder metadata ──────────────────────────────────────
	metaProviders: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<{ providers: TAgentMetaProvider[] }>>(E.metaProviders(ws), { signal })
			.then((r) => r.data.data.providers),

	metaModels: (ws: string, provider?: string, signal?: AbortSignal) =>
		axiosClient
			.get<
				TApiResponse<{ providers: TAgentMetaModelGroup[] }>
			>(E.metaModels(ws), { params: provider ? { provider } : undefined, signal })
			.then((r) => r.data.data.providers),

	metaTools: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<{ tools: TAgentMetaTool[] }>>(E.metaTools(ws), { signal })
			.then((r) => r.data.data.tools),

	metaCategories: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<{ categories: TAgentMetaCategory[] }>>(E.metaCategories(ws), { signal })
			.then((r) => r.data.data.categories),

	metaTriggerTypes: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<
				TApiResponse<{ trigger_types: TAgentMetaTriggerType[] }>
			>(E.metaTriggerTypes(ws), { signal })
			.then((r) => r.data.data.trigger_types),
};

export const AgentSkillService = {
	list: (ws: string, filters?: TSkillFilters, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentSkill[]>>(S.list(ws), { params: filters, signal })
			.then(unwrap<TAgentSkill[]>),

	detail: (ws: string, skillId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentSkill>>(S.detail(ws, skillId), { signal })
			.then(unwrap<TAgentSkill>),

	create: (ws: string, body: Partial<TAgentSkill>) =>
		axiosClient.post<TApiResponse<TAgentSkill>>(S.create(ws), body).then(unwrap<TAgentSkill>),

	generate: (ws: string, body: TGenerateSkillDto) =>
		axiosClient
			.post<
				TApiResponse<TGeneratedSkillDraft>
			>(S.generate(ws), body, { timeout: 60_000 })
			.then(unwrap<TGeneratedSkillDraft>),

	update: (ws: string, skillId: string, body: Partial<TAgentSkill>) =>
		axiosClient
			.put<TApiResponse<TAgentSkill>>(S.update(ws, skillId), body)
			.then(unwrap<TAgentSkill>),

	remove: (ws: string, skillId: string) =>
		axiosClient.delete(S.delete(ws, skillId)).then(() => undefined),

	addReference: (ws: string, skillId: string, body: Partial<TAgentSkillReference>) =>
		axiosClient
			.post<TApiResponse<TAgentSkillReference>>(S.addReference(ws, skillId), body)
			.then(unwrap<TAgentSkillReference>),

	updateReference: (
		ws: string,
		skillId: string,
		referenceId: string,
		body: Partial<TAgentSkillReference>,
	) =>
		axiosClient
			.put<
				TApiResponse<TAgentSkillReference>
			>(S.updateReference(ws, skillId, referenceId), body)
			.then(unwrap<TAgentSkillReference>),

	removeReference: (ws: string, skillId: string, referenceId: string) =>
		axiosClient.delete(S.removeReference(ws, skillId, referenceId)).then(() => undefined),

	addScript: (ws: string, skillId: string, body: Partial<TAgentSkillScript>) =>
		axiosClient
			.post<TApiResponse<TAgentSkillScript>>(S.addScript(ws, skillId), body)
			.then(unwrap<TAgentSkillScript>),

	updateScript: (
		ws: string,
		skillId: string,
		scriptId: string,
		body: Partial<TAgentSkillScript>,
	) =>
		axiosClient
			.put<TApiResponse<TAgentSkillScript>>(S.updateScript(ws, skillId, scriptId), body)
			.then(unwrap<TAgentSkillScript>),

	removeScript: (ws: string, skillId: string, scriptId: string) =>
		axiosClient.delete(S.removeScript(ws, skillId, scriptId)).then(() => undefined),
};
