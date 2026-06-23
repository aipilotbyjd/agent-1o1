import { useRef } from 'react';
import { WorkflowService } from '@/api/modules/workflows';
import { ExecutionService } from '@/api/modules/executions';
import { createId } from '../_context/WorkflowEditorStore.context';
import { useWorkflowEditor } from '../_context/WorkflowEditorProvider.context';
import { createMockNodeOutput, getRunOrder } from '../_helper/runGraph.helper';
import { getNodeDefinition } from '../_helper/nodeCatalog.constants';
import type { TRunLog } from '../_types/run.type';
import type { TNodeRunStatus } from '../_types/node.type';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const useRunWorkflow = () => {
	const { state, dispatch } = useWorkflowEditor();
	const stopped = useRef(false);
	const stepResolveRef = useRef<(() => void) | null>(null);

	// Subscribe to STEP_NEXT events by watching state changes
	// The step is resolved by the hook on dispatch of STEP_NEXT
	const waitForStep = (): Promise<void> =>
		new Promise((resolve) => {
			stepResolveRef.current = resolve;
			dispatch({ type: 'STEP_NEXT' }); // reset waitingForStep
		});

	const runWorkflow = async () => {
		const isRunDisabled = state.nodes.length === 0 && state.ui.emptyCanvasView !== 'chat-started';
		if (isRunDisabled) return;

		if (state.run.status === 'running') return;

		// Check for missing credentials
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
		dispatch({ type: 'RUN_START', id: createId('run') });

		if (state.workflow.workspaceId && state.workflow.apiId) {
			const ws = state.workflow.workspaceId;
			const wfId = state.workflow.apiId;
			try {
				const execution = await WorkflowService.execute(ws, wfId, {
					trigger_data: {},
				});
				dispatch({ type: 'RUN_START', id: execution.id });
				dispatch({
					type: 'APPEND_LOG',
					log: {
						level: 'info',
						message: `Execution ${execution.id} started with status ${execution.status}`,
					},
				});

				let status = execution.status;
				const poll = async () => {
					if (stopped.current) return;
					try {
						const detail = await ExecutionService.detail(ws, execution.id);
						status = detail.status;

						const nodesData = await ExecutionService.nodes(ws, execution.id) as any;
						const nodesList = Array.isArray(nodesData) ? nodesData : (nodesData?.data ?? []);

						for (const nodeRes of nodesList) {
							const nodeRunKey = nodeRes.node_run_key;
							if (nodeRunKey) {
								let nodeStatus: TNodeRunStatus = 'idle';
								if (nodeRes.status === 'completed') {
									nodeStatus = 'success';
								} else if (nodeRes.status === 'failed') {
									nodeStatus = 'error';
								} else if (nodeRes.status === 'running') {
									nodeStatus = 'running';
								} else if (nodeRes.status === 'pending') {
									nodeStatus = 'queued';
								} else if (nodeRes.status === 'skipped') {
									nodeStatus = 'skipped';
								}

								dispatch({
									type: 'SET_NODE_STATUS',
									id: nodeRunKey,
									status: nodeStatus,
									durationMs: nodeRes.duration_ms,
									error: nodeRes.error?.message,
									outputPreview: nodeRes.output_data,
								});

								if (nodeRes.status === 'running') {
									dispatch({ type: 'RUN_CURRENT_NODE', nodeId: nodeRunKey });
								}
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

				while ((status === 'running' || status === 'queued' || status === 'pending') && !stopped.current) {
					await wait(2000);
					await poll();
				}

				if (stopped.current) {
					try {
						await ExecutionService.cancel(ws, execution.id);
					} catch (e) {
						console.error('Failed to cancel execution on backend:', e);
					}
					dispatch({ type: 'RUN_FINISH', status: 'stopped' });
				} else {
					const finalStatus: 'success' | 'error' = status === 'completed' ? 'success' : 'error';
					dispatch({ type: 'RUN_FINISH', status: finalStatus });
					dispatch({
						type: 'APPEND_LOG',
						log: {
							level: finalStatus === 'success' ? 'info' : 'error',
							message: `Execution finished with status: ${status}`,
						},
					});
				}
			} catch (error) {
				dispatch({
					type: 'APPEND_LOG',
					log: {
						level: 'error',
						message:
							error instanceof Error ? error.message : 'Failed to execute workflow',
					},
				});
				dispatch({ type: 'RUN_FINISH', status: 'error' });
			}
			return;
		}

		const order = getRunOrder(state.nodes, state.edges);

		for (const node of order) {
			if (stopped.current) break;

			// Breakpoint: pause and set waitingForStep
			if (node.data.breakpoint && state.ui.stepMode) {
				dispatch({
					type: 'APPEND_LOG',
					log: {
						nodeId: node.id,
						level: 'info',
						message: `⏸ Breakpoint hit at ${node.data.label}`,
					},
				});
				// Signal UI to show "Step" button
				// We wait until the user dispatches STEP_NEXT
				// Achieved by polling state ref — simpler: use a 30s timeout as safety
				let resolved = false;
				dispatch({ type: 'RUN_CURRENT_NODE', nodeId: node.id });
				const stepPromise = new Promise<void>((resolve) => {
					stepResolveRef.current = () => {
						resolved = true;
						resolve();
					};
					// Safety timeout 60s
					setTimeout(() => {
						if (!resolved) resolve();
					}, 60_000);
				});
				// Temporarily mark waitingForStep via a custom log message for the UI
				await stepPromise;
				if (stopped.current) break;
			}

			const started = performance.now();
			dispatch({ type: 'RUN_CURRENT_NODE', nodeId: node.id });
			dispatch({ type: 'SET_NODE_STATUS', id: node.id, status: 'running' });
			dispatch({
				type: 'APPEND_LOG',
				log: { nodeId: node.id, level: 'info', message: `${node.data.label} started` },
			});

			const delayMs = state.ui.stepMode ? 150 : 300;
			await wait(delayMs);

			if (stopped.current) break;

			const durationMs = Math.round(performance.now() - started);
			dispatch({
				type: 'SET_NODE_STATUS',
				id: node.id,
				status: 'success',
				durationMs,
				outputPreview: createMockNodeOutput(node),
			});
			dispatch({
				type: 'APPEND_LOG',
				log: {
					nodeId: node.id,
					level: 'info',
					message: `${node.data.label} finished in ${durationMs}ms`,
				},
			});

			// In step mode (non-breakpoint), pause between every node
			if (state.ui.stepMode && !node.data.breakpoint) {
				await wait(80);
			}
		}

		dispatch({ type: 'RUN_FINISH', status: stopped.current ? 'stopped' : 'success' });
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
