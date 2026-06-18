import { useRef } from 'react';
import { WorkflowService } from '@/api/modules/workflows';
import { createId } from '../_context/WorkflowEditorStore.context';
import { useWorkflowEditor } from '../_context/WorkflowEditorProvider.context';
import { createMockNodeOutput, getRunOrder } from '../_helper/runGraph.helper';
import { getNodeDefinition } from '../_helper/nodeCatalog.constants';

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
			try {
				const execution = await WorkflowService.execute(
					state.workflow.workspaceId,
					state.workflow.apiId,
					{
						trigger_data: {},
					},
				);
				dispatch({
					type: 'APPEND_LOG',
					log: {
						level: 'info',
						message: `Execution ${execution.id} started with status ${execution.status}`,
					},
				});
				dispatch({ type: 'RUN_FINISH', status: 'success' });
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
