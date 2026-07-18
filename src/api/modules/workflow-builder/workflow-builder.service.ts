import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse, TPaginatedResponse } from '@/api/core';
import type { IWorkflow } from '@/types/workflow.type';
import type {
	IBuilderSession,
	IBuilderMessage,
	IBuilderDraftVersion,
	IBuilderValidationResult,
	IListSessionsParams,
	IListMessagesParams,
	IListVersionsParams,
	ICreateSessionDto,
	IRenameSessionDto,
	ISyncDraftDto,
	ISendBuilderMessageDto,
	TCreateSessionResponse,
	ISendMessageResponse,
	IGenerateWorkflowDto,
	IGenerateWorkflowResult,
	IExplainWorkflowDto,
	IExplainWorkflowResult,
	ISuggestNodesDto,
	ISuggestNodesResult,
	IConfigureNodeDto,
	IConfigureNodeResult,
	ISuggestEnhancementsDto,
	ISuggestEnhancementsResult,
} from '@/types/workflowBuilder.type';
import { WorkflowBuilderEndpoints as E } from './workflow-builder.endpoints';

export const WorkflowBuilderService = {
	// ── Sessions ──────────────────────────────────────
	listSessions: (ws: string, params?: IListSessionsParams, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<IBuilderSession>>(E.sessions(ws), { params, signal })
			.then((r) => r.data),

	getSession: (ws: string, id: string, signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IBuilderSession>>(E.session(ws, id), { signal })
			.then(unwrap<IBuilderSession>),

	createSession: (ws: string, body: ICreateSessionDto) =>
		axiosClient
			.post<TApiResponse<TCreateSessionResponse>>(E.sessionCreate(ws), body)
			.then(unwrap<TCreateSessionResponse>),

	renameSession: (ws: string, id: string, body: IRenameSessionDto) =>
		axiosClient
			.patch<TApiResponse<IBuilderSession>>(E.sessionUpdate(ws, id), body)
			.then(unwrap<IBuilderSession>),

	discardSession: (ws: string, id: string) =>
		axiosClient.delete(E.sessionDelete(ws, id)).then(() => undefined),

	validateSession: (ws: string, id: string) =>
		axiosClient
			.post<TApiResponse<IBuilderValidationResult>>(E.sessionValidate(ws, id))
			.then(unwrap<IBuilderValidationResult>),

	saveSession: (ws: string, id: string) =>
		axiosClient.post<TApiResponse<IWorkflow>>(E.sessionSave(ws, id)).then(unwrap<IWorkflow>),

	/** Syncs manual canvas edits back into the session's draft so the AI stays aware of them. */
	syncDraft: (ws: string, id: string, body: ISyncDraftDto) =>
		axiosClient
			.patch<TApiResponse<IBuilderSession>>(E.sessionDraftSync(ws, id), body)
			.then(unwrap<IBuilderSession>),

	// ── Messages ──────────────────────────────────────
	listMessages: (ws: string, id: string, params?: IListMessagesParams, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<IBuilderMessage>>(E.messages(ws, id), { params, signal })
			.then((r) => r.data),

	sendMessage: (ws: string, id: string, body: ISendBuilderMessageDto) =>
		axiosClient
			.post<TApiResponse<ISendMessageResponse>>(E.messageCreate(ws, id), body)
			.then(unwrap<ISendMessageResponse>),

	// ── Draft versions ────────────────────────────────
	listVersions: (ws: string, id: string, params?: IListVersionsParams, signal?: AbortSignal) =>
		axiosClient
			.get<TPaginatedResponse<IBuilderDraftVersion>>(E.versions(ws, id), { params, signal })
			.then((r) => r.data),

	restoreVersion: (ws: string, id: string, versionId: string) =>
		axiosClient
			.post<TApiResponse<IBuilderSession>>(E.versionRestore(ws, id, versionId))
			.then(unwrap<IBuilderSession>),

	// ── One-shot generation ───────────────────────────
	generate: (ws: string, body: IGenerateWorkflowDto) =>
		axiosClient
			.post<TApiResponse<IGenerateWorkflowResult>>(E.generate(ws), body)
			.then(unwrap<IGenerateWorkflowResult>),

	explain: (ws: string, body: IExplainWorkflowDto) =>
		axiosClient
			.post<TApiResponse<IExplainWorkflowResult>>(E.explain(ws), body)
			.then(unwrap<IExplainWorkflowResult>),

	suggestNodes: (ws: string, body: ISuggestNodesDto) =>
		axiosClient
			.post<TApiResponse<ISuggestNodesResult>>(E.suggestNodes(ws), body)
			.then(unwrap<ISuggestNodesResult>),

	configureNode: (ws: string, body: IConfigureNodeDto) =>
		axiosClient
			.post<TApiResponse<IConfigureNodeResult>>(E.configureNode(ws), body)
			.then(unwrap<IConfigureNodeResult>),

	suggestEnhancements: (ws: string, body: ISuggestEnhancementsDto) =>
		axiosClient
			.post<TApiResponse<ISuggestEnhancementsResult>>(E.suggestEnhancements(ws), body)
			.then(unwrap<ISuggestEnhancementsResult>),
};
