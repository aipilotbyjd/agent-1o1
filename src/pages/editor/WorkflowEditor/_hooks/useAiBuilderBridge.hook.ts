import { useEffect, useRef } from 'react';
import { useRealtime } from '@/context/realtimeContext';
import { useAiChatStore } from '@/store/aiChat.store';
import { WorkflowBuilderService } from '@/api/modules/workflow-builder/workflow-builder.service';
import {
	subscribeToBuilderSession,
	type IEchoLike,
} from '@/api/modules/workflow-builder/workflow-builder.realtime';
import type { IBuilderMessage, IBuilderMessageReadyEvent } from '@/types/workflowBuilder.type';
import { useWorkflowEditor } from '../_context/WorkflowEditorProvider.context';
import { useWorkflowRouteParams } from './useWorkflowRouteParams.hook';
import { builderDraftToCanvas } from '../_helper/builderDraft.helper';

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 120_000;

/**
 * Connects the AI chat store to the real backend workflow builder.
 *
 * - Feeds the current workspace/workflow into the store so it can call the API.
 * - Subscribes to the builder session's private realtime channel for instant
 *   results, AND polls the session as a fallback (realtime auth can be flaky on
 *   some deploys). Whichever arrives first wins; the other is a no-op.
 *
 * When a result arrives it pushes the assistant reply into the chat and applies
 * the generated nodes/edges to the canvas.
 *
 * Mount once inside the editor (where the WorkflowEditor + Realtime providers and
 * the route params are all available).
 */
export const useAiBuilderBridge = () => {
	const { echo } = useRealtime();
	const { dispatch } = useWorkflowEditor();
	const { workspaceId, workflowId } = useWorkflowRouteParams();

	const builderSessionId = useAiChatStore((s) => s.builderSessionId);
	const hydratedSessionId = useAiChatStore((s) => s.hydratedSessionId);
	const pendingMessageId = useAiChatStore((s) => s.pendingMessageId);
	const isThinking = useAiChatStore((s) => s.isThinking);
	const setBuilderContext = useAiChatStore((s) => s.setBuilderContext);
	const applyReadyMessage = useAiChatStore((s) => s.applyReadyMessage);
	const hydrateFromBackend = useAiChatStore((s) => s.hydrateFromBackend);
	const failPending = useAiChatStore((s) => s.failPending);
	const setPendingDraft = useAiChatStore((s) => s.setPendingDraft);
	const appendTextDelta = useAiChatStore((s) => s.appendTextDelta);
	const pushToolCall = useAiChatStore((s) => s.pushToolCall);
	const resolveToolResult = useAiChatStore((s) => s.resolveToolResult);

	// Guards against applying the same assistant message twice (e.g. realtime and
	// poll both delivering it).
	const appliedMessageIds = useRef<Set<string>>(new Set());

	// Keep the store's API context in sync with the route.
	useEffect(() => {
		setBuilderContext(workspaceId ?? null, workflowId ?? null);
	}, [workspaceId, workflowId, setBuilderContext]);

	// Resume: when the store points at a backend session we haven't loaded yet
	// (e.g. after a page reload), pull it from the server and rebuild the chat +
	// canvas from that authoritative state.
	useEffect(() => {
		if (!workspaceId || !builderSessionId || builderSessionId === hydratedSessionId) return;

		let cancelled = false;
		WorkflowBuilderService.getSession(workspaceId, builderSessionId)
			.then((session) => {
				if (cancelled) return;
				hydrateFromBackend(session);
				(session.messages ?? []).forEach((m) => {
					if (m.processing_status === 'completed' || m.processing_status === 'failed') {
						appliedMessageIds.current.add(m.id);
					}
				});
				const { nodes, edges } = builderDraftToCanvas({
					nodes: session.nodes_draft ?? [],
					edges: session.edges_draft ?? [],
				});
				if (nodes.length) dispatch({ type: 'APPLY_BUILDER_DRAFT', nodes, edges });
			})
			.catch(() => {
				/* stale/deleted session — leave the fresh chat as-is */
			});

		return () => {
			cancelled = true;
		};
	}, [workspaceId, builderSessionId, hydratedSessionId, hydrateFromBackend, dispatch]);

	// Shared handler: surface an assistant result (from realtime or poll) exactly
	// once. The generated draft is held for the user to review — see
	// AiBuilderPanel's Apply/Discard — rather than written to the canvas here.
	const applyResult = (event: IBuilderMessageReadyEvent) => {
		if (appliedMessageIds.current.has(event.message.id)) return;
		appliedMessageIds.current.add(event.message.id);

		if (event.error) {
			failPending(event.message?.error_message ?? undefined);
			return;
		}

		applyReadyMessage(event);
		if ((event.draft?.nodes?.length ?? 0) > 0) {
			setPendingDraft(event.draft, event.message.id);
		}
	};

	// Realtime path — instant when broadcasting is healthy.
	useEffect(() => {
		if (!echo || !builderSessionId) return;

		const unsubscribe = subscribeToBuilderSession(echo as unknown as IEchoLike, builderSessionId, {
			onReady: applyResult,
			onError: applyResult,
			onTextDelta: (event) => appendTextDelta(event.delta),
			onToolCall: (event) => pushToolCall(event.tool_id, event.tool_name),
			onToolResult: (event) => resolveToolResult(event.tool_id, event.successful),
		});

		return unsubscribe;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [echo, builderSessionId]);

	// Polling fallback — works even when the WebSocket never connects. Waits for
	// the specific assistant message the backend queued (pendingMessageId) to
	// reach a terminal status, so it never applies a stale earlier reply.
	useEffect(() => {
		if (!workspaceId || !builderSessionId || !pendingMessageId || !isThinking) return;

		let cancelled = false;
		const startedAt = Date.now();

		const isTerminal = (m: IBuilderMessage) =>
			m.processing_status === 'completed' || m.processing_status === 'failed';

		const poll = async () => {
			try {
				const session = await WorkflowBuilderService.getSession(workspaceId, builderSessionId);
				if (cancelled) return;

				const target = (session.messages ?? []).find((m) => m.id === pendingMessageId);
				if (target && isTerminal(target)) {
					applyResult({
						message: target,
						draft: { nodes: session.nodes_draft ?? [], edges: session.edges_draft ?? [] },
						version: null,
						session: { id: session.id, title: session.title, status: session.status },
						error: target.processing_status === 'failed',
					});
					return;
				}

				if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
					failPending('The builder took too long to respond. Please try again.');
				}
			} catch {
				/* transient — the next tick will retry */
			}
		};

		void poll();
		const timer = window.setInterval(poll, POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			window.clearInterval(timer);
		};
	}, [workspaceId, builderSessionId, pendingMessageId, isThinking]);
};
