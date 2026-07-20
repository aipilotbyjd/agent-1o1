import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	TAgent,
	TAgentSkill,
	TSendAgentMessageDto,
	TAgentTrigger,
	TAgentSkillReference,
	TAgentSkillScript,
	TSkillFilters,
	TGenerateSkillDto,
	TAgentRunsFilters,
	TAgentAnalyticsFilters,
	TAgentKnowledgeFilters,
	TCreateAgentKnowledgeDto,
	TUpdateAgentKnowledgeDto,
	TAgentMemoryScope,
	TCreateAgentMemoryDto,
} from '@/types/agent.type';
import { AgentService, AgentSkillService } from './agents.service';
import { agentKeys, agentSkillKeys } from './agents.keys';

// ── Agents ───────────────────────────────────────────
export const useAgents = (ws: string) =>
	useQuery({
		queryKey: agentKeys.list(ws),
		queryFn: ({ signal }) => AgentService.list(ws, signal),
		enabled: !!ws,
	});

export const useAgent = (ws: string, agentId: string) =>
	useQuery({
		queryKey: agentKeys.detail(ws, agentId),
		queryFn: ({ signal }) => AgentService.detail(ws, agentId, signal),
		enabled: !!ws && !!agentId,
	});

export const useAgentConversations = (ws: string, agentId: string) =>
	useQuery({
		queryKey: agentKeys.conversations(ws, agentId),
		queryFn: ({ signal }) => AgentService.listConversations(ws, agentId, signal),
		enabled: !!ws && !!agentId,
	});

export const useCreateAgent = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Partial<TAgent>) => AgentService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentKeys.all(ws) });
			notify.success('Agent created');
		},
		onError: notify.fromError('Failed to create agent'),
	});
};

export const useUpdateAgent = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ agentId, body }: { agentId: string; body: Partial<TAgent> }) =>
			AgentService.update(ws, agentId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentKeys.all(ws) });
			notify.success('Agent updated');
		},
		onError: notify.fromError('Failed to update agent'),
	});
};

export const useDeleteAgent = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (agentId: string) => AgentService.remove(ws, agentId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentKeys.all(ws) });
			notify.success('Agent deleted');
		},
		onError: notify.fromError('Failed to delete agent'),
	});
};

export const useDuplicateAgent = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (agentId: string) => AgentService.duplicate(ws, agentId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentKeys.all(ws) });
			notify.success('Agent duplicated');
		},
		onError: notify.fromError('Failed to duplicate agent'),
	});
};

export const useAttachAgentSkill = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ agentId, skillId }: { agentId: string; skillId: string }) =>
			AgentService.attachSkill(ws, agentId, skillId),
		onSuccess: (_d, { agentId }) => {
			qc.invalidateQueries({ queryKey: agentKeys.detail(ws, agentId) });
			notify.success('Skill attached');
		},
		onError: notify.fromError('Failed to attach skill'),
	});
};

export const useDetachAgentSkill = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ agentId, skillId }: { agentId: string; skillId: string }) =>
			AgentService.detachSkill(ws, agentId, skillId),
		onSuccess: (_d, { agentId }) => {
			qc.invalidateQueries({ queryKey: agentKeys.detail(ws, agentId) });
			notify.success('Skill detached');
		},
		onError: notify.fromError('Failed to detach skill'),
	});
};

// ── Skills ───────────────────────────────────────────
export const useAgentSkills = (ws: string, filters?: TSkillFilters) =>
	useQuery({
		queryKey: agentSkillKeys.list(ws, filters),
		queryFn: ({ signal }) => AgentSkillService.list(ws, filters, signal),
		enabled: !!ws,
	});

export const useCreateAgentSkill = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Partial<TAgentSkill>) => AgentSkillService.create(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentSkillKeys.all(ws) });
			notify.success('Skill created');
		},
		onError: notify.fromError('Failed to create skill'),
	});
};

export const useUpdateAgentSkill = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ skillId, body }: { skillId: string; body: Partial<TAgentSkill> }) =>
			AgentSkillService.update(ws, skillId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentSkillKeys.all(ws) });
			notify.success('Skill updated');
		},
		onError: notify.fromError('Failed to update skill'),
	});
};

export const useGenerateSkill = (ws: string) =>
	useMutation({
		mutationFn: (body: TGenerateSkillDto) => AgentSkillService.generate(ws, body),
		onError: notify.fromError('Failed to generate skill'),
	});

export const useDeleteAgentSkill = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (skillId: string) => AgentSkillService.remove(ws, skillId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentSkillKeys.all(ws) });
			notify.success('Skill deleted');
		},
		onError: notify.fromError('Failed to delete skill'),
	});
};

export const useAgentSkill = (ws: string, skillId: string) =>
	useQuery({
		queryKey: agentSkillKeys.detail(ws, skillId),
		queryFn: ({ signal }) => AgentSkillService.detail(ws, skillId, signal),
		enabled: !!ws && !!skillId,
	});

// ── Agent Conversations ──────────────────────────────
export const useAgentConversation = (ws: string, agentId: string, conversationId: string) =>
	useQuery({
		queryKey: agentKeys.conversation(ws, agentId, conversationId),
		queryFn: ({ signal }) =>
			AgentService.conversationDetail(ws, agentId, conversationId, signal),
		enabled: !!ws && !!agentId && !!conversationId,
	});

export const useCreateAgentConversation = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TSendAgentMessageDto) => AgentService.createConversation(ws, agentId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentKeys.conversations(ws, agentId) });
		},
		onError: notify.fromError('Failed to start conversation'),
	});
};

export const useDeleteAgentConversation = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (conversationId: string) =>
			AgentService.deleteConversation(ws, agentId, conversationId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentKeys.conversations(ws, agentId) });
			notify.success('Conversation deleted');
		},
		onError: notify.fromError('Failed to delete conversation'),
	});
};

export const useSendAgentMessage = (ws: string, agentId: string, conversationId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TSendAgentMessageDto) =>
			AgentService.sendMessage(ws, agentId, conversationId, body),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: agentKeys.conversation(ws, agentId, conversationId),
			});
		},
		onError: notify.fromError('Failed to send message'),
	});
};

// ── Agent Triggers ───────────────────────────────────
export const useAgentTriggers = (ws: string, agentId: string) =>
	useQuery({
		queryKey: agentKeys.triggers(ws, agentId),
		queryFn: ({ signal }) => AgentService.listTriggers(ws, agentId, signal),
		enabled: !!ws && !!agentId,
	});

export const useCreateAgentTrigger = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Partial<TAgentTrigger>) => AgentService.createTrigger(ws, agentId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentKeys.triggers(ws, agentId) });
			notify.success('Trigger created');
		},
		onError: notify.fromError('Failed to create trigger'),
	});
};

export const useUpdateAgentTrigger = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ triggerId, body }: { triggerId: string; body: Partial<TAgentTrigger> }) =>
			AgentService.updateTrigger(ws, agentId, triggerId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentKeys.triggers(ws, agentId) });
			notify.success('Trigger updated');
		},
		onError: notify.fromError('Failed to update trigger'),
	});
};

export const useDeleteAgentTrigger = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (triggerId: string) => AgentService.deleteTrigger(ws, agentId, triggerId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentKeys.triggers(ws, agentId) });
			notify.success('Trigger deleted');
		},
		onError: notify.fromError('Failed to delete trigger'),
	});
};

export const useFireAgentTrigger = (ws: string, agentId: string) =>
	useMutation({
		mutationFn: ({ triggerId, body }: { triggerId: string; body?: Record<string, unknown> }) =>
			AgentService.fireTrigger(ws, agentId, triggerId, body),
		onSuccess: () => notify.success('Trigger fired'),
		onError: notify.fromError('Failed to fire trigger'),
	});

// ── Agent Skill References ───────────────────────────
export const useAddAgentSkillReference = (ws: string, skillId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Partial<TAgentSkillReference>) =>
			AgentSkillService.addReference(ws, skillId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentSkillKeys.detail(ws, skillId) });
			notify.success('Reference added');
		},
		onError: notify.fromError('Failed to add reference'),
	});
};

export const useUpdateAgentSkillReference = (ws: string, skillId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			referenceId,
			body,
		}: {
			referenceId: string;
			body: Partial<TAgentSkillReference>;
		}) => AgentSkillService.updateReference(ws, skillId, referenceId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentSkillKeys.detail(ws, skillId) });
			notify.success('Reference updated');
		},
		onError: notify.fromError('Failed to update reference'),
	});
};

export const useRemoveAgentSkillReference = (ws: string, skillId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (referenceId: string) =>
			AgentSkillService.removeReference(ws, skillId, referenceId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentSkillKeys.detail(ws, skillId) });
			notify.success('Reference removed');
		},
		onError: notify.fromError('Failed to remove reference'),
	});
};

// ── Agent Skill Scripts ──────────────────────────────
export const useAddAgentSkillScript = (ws: string, skillId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Partial<TAgentSkillScript>) =>
			AgentSkillService.addScript(ws, skillId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentSkillKeys.detail(ws, skillId) });
			notify.success('Script added');
		},
		onError: notify.fromError('Failed to add script'),
	});
};

export const useUpdateAgentSkillScript = (ws: string, skillId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ scriptId, body }: { scriptId: string; body: Partial<TAgentSkillScript> }) =>
			AgentSkillService.updateScript(ws, skillId, scriptId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentSkillKeys.detail(ws, skillId) });
			notify.success('Script updated');
		},
		onError: notify.fromError('Failed to update script'),
	});
};

export const useRemoveAgentSkillScript = (ws: string, skillId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (scriptId: string) => AgentSkillService.removeScript(ws, skillId, scriptId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: agentSkillKeys.detail(ws, skillId) });
			notify.success('Script removed');
		},
		onError: notify.fromError('Failed to remove script'),
	});
};

// ── Message request polling (WebSocket fallback) ─────
/**
 * Polls a queued turn's status for clients that can't hold the
 * `agent.stream.{request_id}` socket. Auto-stops once terminal (completed/failed).
 */
export const useAgentMessageRequest = (
	ws: string,
	agentId: string,
	requestId: string | null | undefined,
	options?: { enabled?: boolean; intervalMs?: number },
) =>
	useQuery({
		queryKey: agentKeys.messageRequest(ws, agentId, requestId ?? ''),
		queryFn: ({ signal }) => AgentService.requestStatus(ws, agentId, requestId as string, signal),
		enabled: !!ws && !!agentId && !!requestId && (options?.enabled ?? true),
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			if (status === 'completed' || status === 'failed') return false;
			return options?.intervalMs ?? 2000;
		},
	});

// ── Run history & step traces ────────────────────────
export const useAgentRuns = (ws: string, agentId: string, filters?: TAgentRunsFilters) =>
	useQuery({
		queryKey: agentKeys.runs(ws, agentId, filters),
		queryFn: ({ signal }) => AgentService.listRuns(ws, agentId, filters, signal),
		enabled: !!ws && !!agentId,
	});

export const useAgentRun = (ws: string, agentId: string, runId: string | null | undefined) =>
	useQuery({
		queryKey: agentKeys.run(ws, agentId, runId ?? ''),
		queryFn: ({ signal }) => AgentService.runDetail(ws, agentId, runId as string, signal),
		enabled: !!ws && !!agentId && !!runId,
	});

// ── Usage analytics ──────────────────────────────────
export const useAgentAnalytics = (
	ws: string,
	agentId: string,
	filters?: TAgentAnalyticsFilters,
) =>
	useQuery({
		queryKey: agentKeys.analytics(ws, agentId, filters),
		queryFn: ({ signal }) => AgentService.analytics(ws, agentId, filters, signal),
		enabled: !!ws && !!agentId,
	});

// ── Knowledge base ───────────────────────────────────
export const useAgentKnowledge = (
	ws: string,
	agentId: string,
	filters?: TAgentKnowledgeFilters,
) =>
	useQuery({
		queryKey: agentKeys.knowledge(ws, agentId, filters),
		queryFn: ({ signal }) => AgentService.listKnowledge(ws, agentId, filters, signal),
		enabled: !!ws && !!agentId,
	});

export const useCreateAgentKnowledge = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TCreateAgentKnowledgeDto) =>
			AgentService.createKnowledge(ws, agentId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['agents', ws, agentId, 'knowledge'] });
			notify.success('Knowledge added');
		},
		onError: notify.fromError('Failed to add knowledge'),
	});
};

export const useUpdateAgentKnowledge = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			knowledgeId,
			body,
		}: {
			knowledgeId: string;
			body: TUpdateAgentKnowledgeDto;
		}) => AgentService.updateKnowledge(ws, agentId, knowledgeId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['agents', ws, agentId, 'knowledge'] });
			notify.success('Knowledge updated');
		},
		onError: notify.fromError('Failed to update knowledge'),
	});
};

export const useDeleteAgentKnowledge = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (knowledgeId: string) => AgentService.deleteKnowledge(ws, agentId, knowledgeId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['agents', ws, agentId, 'knowledge'] });
			notify.success('Knowledge deleted');
		},
		onError: notify.fromError('Failed to delete knowledge'),
	});
};

// ── Persistent memory ────────────────────────────────
export const useAgentMemories = (ws: string, agentId: string, scope?: TAgentMemoryScope) =>
	useQuery({
		queryKey: agentKeys.memories(ws, agentId, scope),
		queryFn: ({ signal }) => AgentService.listMemories(ws, agentId, scope, signal),
		enabled: !!ws && !!agentId,
	});

export const useCreateAgentMemory = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: TCreateAgentMemoryDto) => AgentService.createMemory(ws, agentId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['agents', ws, agentId, 'memories'] });
			notify.success('Memory saved');
		},
		onError: notify.fromError('Failed to save memory'),
	});
};

export const useDeleteAgentMemory = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (memoryId: string) => AgentService.deleteMemory(ws, agentId, memoryId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['agents', ws, agentId, 'memories'] });
			notify.success('Memory deleted');
		},
		onError: notify.fromError('Failed to delete memory'),
	});
};

export const useClearAgentMemories = (ws: string, agentId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (scope?: TAgentMemoryScope) => AgentService.clearMemories(ws, agentId, scope),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['agents', ws, agentId, 'memories'] });
			notify.success('Memories cleared');
		},
		onError: notify.fromError('Failed to clear memories'),
	});
};

// ── Builder metadata ─────────────────────────────────
export const useAgentMetaProviders = (ws: string) =>
	useQuery({
		queryKey: agentKeys.meta(ws, 'providers'),
		queryFn: ({ signal }) => AgentService.metaProviders(ws, signal),
		enabled: !!ws,
		staleTime: 5 * 60 * 1000,
	});

export const useAgentMetaModels = (ws: string, provider?: string) =>
	useQuery({
		queryKey: agentKeys.meta(ws, 'models', provider),
		queryFn: ({ signal }) => AgentService.metaModels(ws, provider, signal),
		enabled: !!ws,
		staleTime: 5 * 60 * 1000,
	});

export const useAgentMetaTools = (ws: string) =>
	useQuery({
		queryKey: agentKeys.meta(ws, 'tools'),
		queryFn: ({ signal }) => AgentService.metaTools(ws, signal),
		enabled: !!ws,
		staleTime: 5 * 60 * 1000,
	});

export const useAgentMetaCategories = (ws: string) =>
	useQuery({
		queryKey: agentKeys.meta(ws, 'categories'),
		queryFn: ({ signal }) => AgentService.metaCategories(ws, signal),
		enabled: !!ws,
		staleTime: 5 * 60 * 1000,
	});

export const useAgentMetaTriggerTypes = (ws: string) =>
	useQuery({
		queryKey: agentKeys.meta(ws, 'trigger-types'),
		queryFn: ({ signal }) => AgentService.metaTriggerTypes(ws, signal),
		enabled: !!ws,
		staleTime: 5 * 60 * 1000,
	});
