import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import type {
	IBuilderSession,
	IListSessionsParams,
	IListMessagesParams,
	IListVersionsParams,
	ICreateSessionDto,
	IRenameSessionDto,
	ISendBuilderMessageDto,
	IGenerateWorkflowDto,
	IExplainWorkflowDto,
	ISuggestNodesDto,
	IConfigureNodeDto,
	ISuggestEnhancementsDto,
	IBuilderMessageReadyEvent,
} from '@/types/workflowBuilder.type';
import { WorkflowBuilderService } from './workflow-builder.service';
import { workflowBuilderKeys } from './workflow-builder.keys';
import { subscribeToBuilderSession, type IEchoLike } from './workflow-builder.realtime';

// ── Sessions ─────────────────────────────────────────
export const useBuilderSessions = (ws: string, params?: IListSessionsParams) =>
	useQuery({
		queryKey: workflowBuilderKeys.sessions(ws, params),
		queryFn: ({ signal }) => WorkflowBuilderService.listSessions(ws, params, signal),
		enabled: !!ws,
	});

export const useBuilderSession = (ws: string, sessionId: string) =>
	useQuery({
		queryKey: workflowBuilderKeys.session(ws, sessionId),
		queryFn: ({ signal }) => WorkflowBuilderService.getSession(ws, sessionId, signal),
		enabled: !!ws && !!sessionId,
	});

export const useCreateBuilderSession = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: ICreateSessionDto) => WorkflowBuilderService.createSession(ws, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowBuilderKeys.all(ws) });
		},
		onError: notify.fromError('Failed to create session'),
	});
};

export const useRenameBuilderSession = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ sessionId, body }: { sessionId: string; body: IRenameSessionDto }) =>
			WorkflowBuilderService.renameSession(ws, sessionId, body),
		onSuccess: (session) => {
			qc.setQueryData(workflowBuilderKeys.session(ws, session.id), session);
			qc.invalidateQueries({ queryKey: workflowBuilderKeys.all(ws) });
			notify.success('Session renamed');
		},
		onError: notify.fromError('Failed to rename session'),
	});
};

export const useDiscardBuilderSession = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (sessionId: string) => WorkflowBuilderService.discardSession(ws, sessionId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: workflowBuilderKeys.all(ws) });
			notify.success('Session discarded');
		},
		onError: notify.fromError('Failed to discard session'),
	});
};

export const useValidateBuilderSession = (ws: string) =>
	useMutation({
		mutationFn: (sessionId: string) => WorkflowBuilderService.validateSession(ws, sessionId),
		onError: notify.fromError('Failed to validate draft'),
	});

export const useSaveBuilderSession = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (sessionId: string) => WorkflowBuilderService.saveSession(ws, sessionId),
		onSuccess: (_workflow, sessionId) => {
			qc.invalidateQueries({ queryKey: workflowBuilderKeys.session(ws, sessionId) });
			qc.invalidateQueries({ queryKey: workflowBuilderKeys.all(ws) });
			qc.invalidateQueries({ queryKey: ['workflows', ws] });
			notify.success('Workflow saved');
		},
		onError: notify.fromError('Failed to save workflow'),
	});
};

// ── Messages ─────────────────────────────────────────
export const useBuilderMessages = (ws: string, sessionId: string, params?: IListMessagesParams) =>
	useQuery({
		queryKey: workflowBuilderKeys.messages(ws, sessionId, params),
		queryFn: ({ signal }) =>
			WorkflowBuilderService.listMessages(ws, sessionId, params, signal),
		enabled: !!ws && !!sessionId,
	});

export const useSendBuilderMessage = (ws: string, sessionId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: ISendBuilderMessageDto) =>
			WorkflowBuilderService.sendMessage(ws, sessionId, body),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: workflowBuilderKeys.messages(ws, sessionId),
			});
		},
		onError: notify.fromError('Failed to send message'),
	});
};

// ── Draft versions ───────────────────────────────────
export const useBuilderVersions = (ws: string, sessionId: string, params?: IListVersionsParams) =>
	useQuery({
		queryKey: workflowBuilderKeys.versions(ws, sessionId, params),
		queryFn: ({ signal }) =>
			WorkflowBuilderService.listVersions(ws, sessionId, params, signal),
		enabled: !!ws && !!sessionId,
	});

export const useRestoreBuilderVersion = (ws: string, sessionId: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (versionId: string) =>
			WorkflowBuilderService.restoreVersion(ws, sessionId, versionId),
		onSuccess: (session) => {
			qc.setQueryData(workflowBuilderKeys.session(ws, session.id), session);
			qc.invalidateQueries({ queryKey: workflowBuilderKeys.versions(ws, sessionId) });
			notify.success('Draft restored');
		},
		onError: notify.fromError('Failed to restore draft'),
	});
};

// ── One-shot generation ──────────────────────────────
export const useGenerateWorkflow = (ws: string) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: IGenerateWorkflowDto) => WorkflowBuilderService.generate(ws, body),
		onSuccess: (result) => {
			if (result.workflow) qc.invalidateQueries({ queryKey: ['workflows', ws] });
		},
		onError: notify.fromError('Failed to generate workflow'),
	});
};

export const useExplainWorkflow = (ws: string) =>
	useMutation({
		mutationFn: (body: IExplainWorkflowDto) => WorkflowBuilderService.explain(ws, body),
		onError: notify.fromError('Failed to explain workflow'),
	});

export const useSuggestNodes = (ws: string) =>
	useMutation({
		mutationFn: (body: ISuggestNodesDto) => WorkflowBuilderService.suggestNodes(ws, body),
		onError: notify.fromError('Failed to suggest nodes'),
	});

export const useConfigureNode = (ws: string) =>
	useMutation({
		mutationFn: (body: IConfigureNodeDto) => WorkflowBuilderService.configureNode(ws, body),
		onError: notify.fromError('Failed to configure node'),
	});

export const useSuggestEnhancements = (ws: string) =>
	useMutation({
		mutationFn: (body: ISuggestEnhancementsDto) =>
			WorkflowBuilderService.suggestEnhancements(ws, body),
		onError: notify.fromError('Failed to suggest enhancements'),
	});

// ── Realtime ─────────────────────────────────────────
/**
 * Subscribe to a session's `builder.message.ready` events for the lifetime of
 * the component. On each event the session/messages/versions caches are
 * refreshed so any mounted `useBuilderSession` / `useBuilderMessages` reflect
 * the AI's changes without polling. Pass `null` for `echo` to disable.
 */
export const useBuilderRealtime = (
	ws: string,
	sessionId: string,
	echo: IEchoLike | null | undefined,
	handlers?: {
		onReady?: (event: IBuilderMessageReadyEvent) => void;
		onError?: (event: IBuilderMessageReadyEvent) => void;
	},
) => {
	const qc = useQueryClient();
	const onReady = handlers?.onReady;
	const onError = handlers?.onError;

	useEffect(() => {
		if (!echo || !ws || !sessionId) return;

		const unsubscribe = subscribeToBuilderSession(echo, sessionId, {
			onReady: (event) => {
				qc.invalidateQueries({ queryKey: workflowBuilderKeys.session(ws, sessionId) });
				qc.invalidateQueries({ queryKey: workflowBuilderKeys.messages(ws, sessionId) });
				qc.invalidateQueries({ queryKey: workflowBuilderKeys.versions(ws, sessionId) });
				onReady?.(event);
			},
			onError: (event) => {
				qc.invalidateQueries({ queryKey: workflowBuilderKeys.messages(ws, sessionId) });
				onError?.(event);
			},
		});

		return unsubscribe;
	}, [echo, ws, sessionId, qc, onReady, onError]);
};
