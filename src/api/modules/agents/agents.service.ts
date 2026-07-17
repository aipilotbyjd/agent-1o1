import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import type {
	TAgent,
	TAgentSkill,
	TAgentConversation,
	TAgentMessage,
	TSendAgentMessageDto,
	TAgentTrigger,
	TAgentSkillReference,
	TAgentSkillScript,
} from '@/types/agent.type';
import type { TExecution } from '@/types/execution.type';
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

	createConversation: (ws: string, agentId: string, body?: Partial<TAgentConversation>) =>
		axiosClient
			.post<TApiResponse<TAgentConversation>>(E.conversationCreate(ws, agentId), body)
			.then(unwrap<TAgentConversation>),

	conversationDetail: (
		ws: string,
		agentId: string,
		conversationId: string,
		signal?: AbortSignal,
	) =>
		axiosClient
			.get<
				TApiResponse<TAgentConversation & { messages?: TAgentMessage[] }>
			>(E.conversationDetail(ws, agentId, conversationId), { signal })
			.then(unwrap<TAgentConversation & { messages?: TAgentMessage[] }>),

	deleteConversation: (ws: string, agentId: string, conversationId: string) =>
		axiosClient.delete(E.conversationDelete(ws, agentId, conversationId)).then(() => undefined),

	sendMessage: (
		ws: string,
		agentId: string,
		conversationId: string,
		body: TSendAgentMessageDto,
	) =>
		axiosClient
			.post<TApiResponse<TAgentMessage>>(E.sendMessage(ws, agentId, conversationId), body)
			.then(unwrap<TAgentMessage>),

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

	execute: (
		ws: string,
		agentId: string,
		body: { message: string; context?: Record<string, unknown> },
	) =>
		axiosClient
			.post<TApiResponse<TExecution>>(E.execute(ws, agentId), body)
			.then(unwrap<TExecution>),
};

export const AgentSkillService = {
	list: (ws: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentSkill[]>>(S.list(ws), { signal })
			.then(unwrap<TAgentSkill[]>),

	detail: (ws: string, skillId: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<TAgentSkill>>(S.detail(ws, skillId), { signal })
			.then(unwrap<TAgentSkill>),

	create: (ws: string, body: Partial<TAgentSkill>) =>
		axiosClient.post<TApiResponse<TAgentSkill>>(S.create(ws), body).then(unwrap<TAgentSkill>),

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
