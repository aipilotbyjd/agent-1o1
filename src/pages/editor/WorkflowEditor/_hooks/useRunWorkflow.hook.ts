import { useRef } from 'react';
import { WorkflowService, useWorkflow } from '@/api/modules/workflows';
import { ExecutionService } from '@/api/modules/executions';
import { createId } from '../_context/WorkflowEditorStore.context';
import { useWorkflowEditor } from '../_context/WorkflowEditorProvider.context';
import { getRunOrder } from '../_helper/runGraph.helper';
import {
	buildTokenMap,
	executeNode,
	isEdgeActive,
	resolveNodeValues,
	type TNodeOutputs,
} from '../_helper/runtime.helper';
import { getNodeDefinition } from '../_helper/nodeCatalog.constants';
import type { TNodeRunRecord, TRunLog, TRunRecord } from '../_types/run.type';
import type { TNodeRunStatus } from '../_types/node.type';
import { notify } from '@/api/core/notify';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Backend poll cadence and safety cap (~5 min) so a stuck execution can't poll forever. */
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150;

/** How long a breakpoint waits for a manual step before auto-continuing. */
const BREAKPOINT_TIMEOUT_MS = 60_000;

/** Map a backend node-execution status onto the editor's local run status. */
const API_NODE_STATUS_MAP: Record<string, TNodeRunStatus> = {
	completed: 'success',
	failed: 'error',
	running: 'running',
	pending: 'queued',
	skipped: 'skipped',
};

/** Shape of a single node result returned by the executions API. */
type TApiNodeResult = {
	node_run_key?: string;
	status?: string;
	duration_ms?: number;
	error?: { message?: string };
	output_data?: unknown;
};

export const useRunWorkflow = () => {
	const { state, dispatch } = useWorkflowEditor();
	const stopped = useRef(false);
	const stepResolveRef = useRef<(() => void) | null>(null);

	const ws = state.workflow.workspaceId;
	const wfId = state.workflow.apiId;
	const workflowQuery = useWorkflow(ws || '', wfId || '');
	const isApiError = workflowQuery.isError;

	/** Finalise a local run: flip status and push the record into history. */
	const finishLocalRun = (
		status: TRunRecord['status'],
		runId: string,
		runStartedAt: number,
		nodeRuns: TNodeRunRecord[],
	) => {
		dispatch({ type: 'RUN_FINISH', status });
		dispatch({
			type: 'PUSH_RUN_HISTORY',
			record: {
				id: runId,
				startedAt: runStartedAt,
				finishedAt: Date.now(),
				status,
				trigger: 'manual',
				nodeRuns,
				logs: [],
			},
		});
	};

	/** Drive a real backend execution: poll status, mirror node states + logs. */
	const runRemoteWorkflow = async (ws: string, wfId: string) => {
		try {
			const execution = await WorkflowService.execute(ws, wfId, { trigger_data: {} });
			if (!execution || !execution.id) {
				throw new Error('Failed to start remote execution: invalid response from server.');
			}
			dispatch({ type: 'RUN_START', id: execution.id });
			dispatch({
				type: 'APPEND_LOG',
				log: {
					level: 'info',
					message: `Execution ${execution.id} started with status ${execution.status || 'running'}`,
				},
			});

			let status = execution.status || 'running';
			const poll = async () => {
				if (stopped.current) return;
				try {
					const detail = await ExecutionService.detail(ws, execution.id);
					status = detail.status;

					const nodesData = await ExecutionService.nodes(ws, execution.id);
					const nodesList: TApiNodeResult[] = Array.isArray(nodesData)
						? nodesData
						: ((nodesData as { data?: TApiNodeResult[] })?.data ?? []);

					for (const nodeRes of nodesList) {
						const nodeRunKey = nodeRes.node_run_key;
						if (!nodeRunKey) continue;

						dispatch({
							type: 'SET_NODE_STATUS',
							id: nodeRunKey,
							status: API_NODE_STATUS_MAP[nodeRes.status ?? ''] ?? 'idle',
							durationMs: nodeRes.duration_ms,
							error: nodeRes.error?.message,
							outputPreview: nodeRes.output_data,
						});

						if (nodeRes.status === 'running') {
							dispatch({ type: 'RUN_CURRENT_NODE', nodeId: nodeRunKey });
						}
					}

					const logsData = await ExecutionService.logs(ws, execution.id);
					if (Array.isArray(logsData)) {
						const mappedLogs: TRunLog[] = logsData.map((log, idx) => ({
							id: `log_${idx}`,
							nodeId: log.node_id,
							level: log.level === 'warning' ? 'warn' : log.level === 'error' ? 'error' : 'info',
							message: log.message,
							at: new Date(log.timestamp).getTime(),
						}));
						dispatch({ type: 'SET_LOGS', logs: mappedLogs });
					}
				} catch (e) {
					console.error('Error polling execution:', e);
				}
			};

			let attempts = 0;
			while ((status === 'running' || status === 'queued' || status === 'pending') && !stopped.current) {
				if (attempts >= MAX_POLL_ATTEMPTS) {
					dispatch({
						type: 'APPEND_LOG',
						log: { level: 'warn', message: 'Stopped polling: execution did not finish in time.' },
					});
					break;
				}
				attempts += 1;
				await wait(POLL_INTERVAL_MS);
				await poll();
			}

			if (stopped.current) {
				try {
					await ExecutionService.cancel(ws, execution.id);
				} catch (e) {
					console.error('Failed to cancel execution on backend:', e);
				}
				dispatch({ type: 'RUN_FINISH', status: 'stopped' });
				return;
			}

			const finalStatus: 'success' | 'error' = status === 'completed' ? 'success' : 'error';
			dispatch({ type: 'RUN_FINISH', status: finalStatus });
			dispatch({
				type: 'APPEND_LOG',
				log: {
					level: finalStatus === 'success' ? 'info' : 'error',
					message: `Execution finished with status: ${status}`,
				},
			});
		} catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to execute workflow';
			notify.error(msg);
			dispatch({ type: 'RUN_FINISH', status: 'error' });
		}
	};

	/**
	 * Run the deterministic frontend simulation. Outputs flow node → node,
	 * branches gate edges, and nodes whose inbound edges are all inactive skip.
	 */
	const runLocalWorkflow = async (runId: string, runStartedAt: number) => {
		const order = getRunOrder(state.nodes, state.edges);

		const outputs: TNodeOutputs = {};
		const branches: Record<string, string> = {};
		const skipped = new Set<string>();
		const nodeRuns: TNodeRunRecord[] = [];

		for (const node of order) {
			if (stopped.current) break;

			const incoming = state.edges.filter((edge) => edge.target === node.id);
			const activeIncoming = incoming.filter((edge) =>
				isEdgeActive(edge, outputs, branches, skipped),
			);

			// Skip when every inbound path is gated off by an upstream branch/skip.
			if (incoming.length > 0 && activeIncoming.length === 0) {
				skipped.add(node.id);
				dispatch({ type: 'SET_NODE_STATUS', id: node.id, status: 'skipped' });
				nodeRuns.push({ nodeId: node.id, label: node.data.label, status: 'skipped' });
				dispatch({
					type: 'APPEND_LOG',
					log: { nodeId: node.id, level: 'info', message: `${node.data.label} skipped (inactive branch)` },
				});
				continue;
			}

			// Breakpoint: pause until the user steps (or a safety timeout fires).
			if (node.data.breakpoint && state.ui.stepMode) {
				dispatch({
					type: 'APPEND_LOG',
					log: {
						nodeId: node.id,
						level: 'info',
						message: `⏸ Breakpoint hit at ${node.data.label}`,
					},
				});
				dispatch({ type: 'RUN_CURRENT_NODE', nodeId: node.id });
				let resolved = false;
				let safetyTimer: ReturnType<typeof setTimeout>;
				await new Promise<void>((resolve) => {
					stepResolveRef.current = () => {
						resolved = true;
						clearTimeout(safetyTimer);
						resolve();
					};
					safetyTimer = setTimeout(() => {
						if (!resolved) resolve();
					}, BREAKPOINT_TIMEOUT_MS);
				});
				if (stopped.current) break;
			}

			const started = performance.now();
			dispatch({ type: 'RUN_CURRENT_NODE', nodeId: node.id });
			dispatch({ type: 'SET_NODE_STATUS', id: node.id, status: 'running' });

			// Pinned nodes reuse their saved output instead of re-executing.
			const usePinned = node.data.pinned && node.data.pinnedOutput !== undefined;

			dispatch({
				type: 'APPEND_LOG',
				log: {
					nodeId: node.id,
					level: 'info',
					message: usePinned ? `${node.data.label} using pinned data` : `${node.data.label} started`,
				},
			});

			if (!usePinned) {
				await wait(state.ui.stepMode ? 150 : 300);
			}

			if (stopped.current) break;

			// Resolve {{expressions}} against upstream outputs, gather active inputs.
			const tokens = buildTokenMap(state.nodes, outputs);
			const resolvedValues = resolveNodeValues(node.data.values, tokens);
			const inputs = activeIncoming.map((edge) => outputs[edge.source]);

			let output: unknown;
			let runError: string | undefined;
			try {
				if (usePinned) {
					output = node.data.pinnedOutput;
				} else {
					const result = executeNode(node, inputs, resolvedValues);
					output = result.output;
					if (result.branch) branches[node.id] = result.branch;
				}
			} catch (error) {
				runError = error instanceof Error ? error.message : 'Node execution failed';
			}

			const durationMs = Math.round(performance.now() - started);

			if (runError) {
				dispatch({
					type: 'SET_NODE_STATUS',
					id: node.id,
					status: 'error',
					durationMs,
					error: runError,
				});
				dispatch({
					type: 'APPEND_LOG',
					log: { nodeId: node.id, level: 'error', message: `${node.data.label} failed: ${runError}` },
				});
				nodeRuns.push({ nodeId: node.id, label: node.data.label, status: 'error', durationMs, error: runError });
				finishLocalRun('error', runId, runStartedAt, nodeRuns);
				return;
			}

			outputs[node.id] = output;
			dispatch({
				type: 'SET_NODE_STATUS',
				id: node.id,
				status: 'success',
				durationMs,
				outputPreview: output,
			});
			nodeRuns.push({ nodeId: node.id, label: node.data.label, status: 'success', durationMs, output });
			dispatch({
				type: 'APPEND_LOG',
				log: {
					nodeId: node.id,
					level: 'info',
					message:
						branches[node.id] !== undefined
							? `${node.data.label} → branch "${branches[node.id]}" (${durationMs}ms)`
							: `${node.data.label} finished in ${durationMs}ms`,
				},
			});

			// In step mode (non-breakpoint), pause between every node.
			if (state.ui.stepMode && !node.data.breakpoint) {
				await wait(80);
			}
		}

		finishLocalRun(stopped.current ? 'stopped' : 'success', runId, runStartedAt, nodeRuns);
	};

	const runWorkflow = async () => {
		const isRunDisabled = state.nodes.length === 0 && state.ui.emptyCanvasView !== 'chat-started';
		if (isRunDisabled) return;
		if (state.run.status === 'running') return;

		// Check for missing credentials.
		const hasMissingCredentials = state.nodes.some((node) => {
			const def = getNodeDefinition(node.data.defKey, node.data.definition);
			return Boolean(def?.requiresCredential) && !node.data.values.credential_id;
		});

		const isMockEmptyState = state.nodes.length === 0 && state.ui.emptyCanvasView === 'chat-started';

		if (hasMissingCredentials || isMockEmptyState) {
			dispatch({ type: 'SET_LINK_CREDENTIALS_OPEN', open: true });
			return;
		}

		stopped.current = false;
		const runId = createId('run');
		const runStartedAt = Date.now();

		if (ws && wfId && !isApiError) {
			await runRemoteWorkflow(ws, wfId);
			return;
		}

		dispatch({ type: 'RUN_START', id: runId });
		await runLocalWorkflow(runId, runStartedAt);
	};

	const stopRun = () => {
		stopped.current = true;
		stepResolveRef.current?.();
		dispatch({ type: 'RUN_FINISH', status: 'stopped' });
	};

	const stepNext = () => {
		stepResolveRef.current?.();
		dispatch({ type: 'STEP_NEXT' });
	};

	return { runWorkflow, stopRun, stepNext };
};
