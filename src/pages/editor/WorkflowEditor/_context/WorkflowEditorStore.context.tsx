import { createContext } from 'react';
import { HISTORY_LIMIT } from '../_helper/builder.constants';
import { getNodeDefinition } from '../_helper/nodeCatalog.constants';

import { autoLayout } from '../_helper/layout.helper';
import type {
	TCanvasEdge,
	TCanvasNode,
	TCanvasPosition,
	TCanvasSnapshot,
} from '../_types/canvas.type';
import type {
	TCanvasNodeData,
	TNodeComment,
	TNodeDefinition,
	TNodeRunStatus,
} from '../_types/node.type';
import type { TRunLog } from '../_types/run.type';
import type {
	TExportedWorkflow,
	TWorkflowEditorState,
	TWorkflowMeta,
} from '../_types/workflow-editor.type';

export type TWorkflowEditorAction =
	| {
			type: 'ADD_NODE';
			defKey: string;
			position: TCanvasPosition;
			definition?: TNodeDefinition;
	  }
	| { type: 'ADD_TEMPLATE'; defKeys: string[]; name: string }
	| { type: 'MOVE_NODE'; id: string; position: TCanvasPosition }
	| { type: 'SELECT_NODE'; id: string | null }
	| { type: 'UPDATE_NODE_VALUE'; id: string; fieldKey: string; value: unknown }
	| { type: 'RENAME_NODE'; id: string; label: string }
	| { type: 'DELETE_SELECTED' }
	| { type: 'DUPLICATE_SELECTED' }
	| {
			type: 'ADD_EDGE';
			source: string;
			target: string;
			sourceHandle?: string;
			targetHandle?: string;
	  }
	| { type: 'REMOVE_EDGE'; id: string }
	| { type: 'AUTO_LAYOUT' }
	| { type: 'UNDO' }
	| { type: 'REDO' }
	| { type: 'SET_WORKFLOW_META'; patch: Partial<TWorkflowMeta> }
	| { type: 'SET_SAVE_STATE'; savingState: TWorkflowMeta['savingState'] }
	| { type: 'TOGGLE_LEFT_PANEL' }
	| { type: 'TOGGLE_RUN_PANEL' }
	| { type: 'TOGGLE_AI_PANEL' }
	| { type: 'TOGGLE_MINIMAP' }
	| { type: 'SET_EMPTY_CANVAS_VIEW'; view: 'ai' | 'templates' | 'chat-started' }
	| { type: 'SET_COMMAND_PALETTE'; open: boolean }
	| { type: 'SET_QUICK_ADD'; open: boolean }
	| { type: 'SET_IMPORT_EXPORT'; open: boolean }
	| { type: 'RUN_START'; id: string }
	| { type: 'RUN_FINISH'; status: 'success' | 'error' | 'stopped' }
	| { type: 'RUN_CURRENT_NODE'; nodeId: string | null }
	| { type: 'APPEND_LOG'; log: Omit<TRunLog, 'id' | 'at'> }
	| { type: 'SET_LOGS'; logs: TRunLog[] }
	| {
			type: 'SET_NODE_STATUS';
			id: string;
			status: TNodeRunStatus;
			durationMs?: number;
			error?: string;
			outputPreview?: unknown;
	  }
	| { type: 'LOAD_WORKFLOW'; workflow: TExportedWorkflow }
	// Node customization
	| { type: 'SET_NODE_COLOR'; id: string; color: string | null }
	| { type: 'TOGGLE_NODE_BREAKPOINT'; id: string }
	| { type: 'ADD_NODE_COMMENT'; id: string; text: string }
	| { type: 'REMOVE_NODE_COMMENT'; id: string; commentId: string }
	| {
			type: 'SET_NODE_TEST_STATUS';
			id: string;
			status: 'idle' | 'running' | 'success' | 'error';
			output?: unknown;
	  }
	// UI state
	| { type: 'SET_SHORTCUTS_OPEN'; open: boolean }
	| { type: 'SET_CANVAS_SEARCH'; open?: boolean; query?: string }
	| { type: 'SET_TEMPLATE_LIBRARY'; open: boolean }
	| { type: 'SET_NODE_DOC'; open: boolean; nodeId?: string | null }
	| { type: 'SET_DIFF_VIEWER'; open: boolean }
	| { type: 'SET_STEP_MODE'; enabled: boolean }
	| { type: 'STEP_NEXT' }
	| { type: 'SET_LINK_CREDENTIALS_OPEN'; open: boolean };

export type TWorkflowEditorContextValue = {
	state: TWorkflowEditorState;
	dispatch: React.Dispatch<TWorkflowEditorAction>;
};

export const WorkflowEditorContext = createContext<TWorkflowEditorContextValue | null>(null);

export const createId = (prefix: string) =>
	`${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;

const initialWorkflow: TWorkflowMeta = {
	id: 'local',
	name: 'AI Lead Routing Agent',
	description: 'Qualify inbound leads, enrich accounts, and route next actions.',
	folder: 'Revenue Ops',
	updatedAt: Date.now(),
	savingState: 'saved',
};

export const initialWorkflowEditorState: TWorkflowEditorState = {
	workflow: initialWorkflow,
	nodes: [],
	edges: [],
	run: {
		id: null,
		status: 'idle',
		startedAt: null,
		finishedAt: null,
		currentNodeId: null,
		logs: [],
	},
	ui: {
		leftPanelOpen: false,
		runPanelOpen: false,
		aiPanelOpen: false,
		miniMapOpen: false,
		commandPaletteOpen: false,
		quickAddOpen: false,
		importExportOpen: false,
		selectedNodeId: null,
		emptyCanvasView: 'ai',
		shortcutsOpen: false,
		canvasSearchOpen: false,
		canvasSearchQuery: '',
		templateLibraryOpen: false,
		diffViewerOpen: false,
		nodeDocOpen: false,
		nodeDocNodeId: null,
		stepMode: false,
		waitingForStep: false,
		linkCredentialsOpen: false,
	},
	history: {
		past: [],
		future: [],
	},
};

const snapshot = (state: TWorkflowEditorState): TCanvasSnapshot => ({
	nodes: structuredClone(state.nodes),
	edges: structuredClone(state.edges),
});

const withHistory = (state: TWorkflowEditorState): TWorkflowEditorState => ({
	...state,
	workflow: { ...state.workflow, savingState: 'dirty', updatedAt: Date.now() },
	history: {
		past: [...state.history.past.slice(-HISTORY_LIMIT + 1), snapshot(state)],
		future: [],
	},
});

const makeNode = (
	defKey: string,
	position: TCanvasPosition,
	runtimeDefinition?: TNodeDefinition,
): TCanvasNode | null => {
	const def = getNodeDefinition(defKey, runtimeDefinition);
	if (!def) return null;
	const values: Record<string, unknown> = {};
	def.fields.forEach((field) => {
		if (field.default !== undefined) values[field.key] = field.default;
	});
	const data: TCanvasNodeData = {
		defKey,
		label: def.label,
		definition: runtimeDefinition,
		values,
		status: 'idle',
	};
	const type =
		def.category === 'input'
			? 'input'
			: def.category === 'trigger'
				? 'trigger'
				: def.category === 'output'
					? 'output'
					: def.category === 'note'
						? 'note'
						: 'base';
	return {
		id: createId('node'),
		type,
		position,
		data,
	};
};

export const workflowEditorReducer = (
	state: TWorkflowEditorState,
	action: TWorkflowEditorAction,
): TWorkflowEditorState => {
	switch (action.type) {
		case 'ADD_NODE': {
			const node = makeNode(action.defKey, action.position, action.definition);
			if (!node) return state;
			const next = withHistory(state);
			return {
				...next,
				nodes: [...next.nodes, node],
				ui: { ...next.ui, selectedNodeId: node.id },
			};
		}
		case 'ADD_TEMPLATE': {
			const next = withHistory(state);
			const nodes = action.defKeys
				.map((key, index) => makeNode(key, { x: 80 + index * 260, y: 120 }))
				.filter(Boolean) as TCanvasNode[];
			const edges: TCanvasEdge[] = [];
			for (let index = 0; index < nodes.length - 1; index += 1) {
				const sourceDef = getNodeDefinition(
					nodes[index].data.defKey,
					nodes[index].data.definition,
				);
				const targetDef = getNodeDefinition(
					nodes[index + 1].data.defKey,
					nodes[index + 1].data.definition,
				);
				if (!sourceDef?.outputs[0] || !targetDef?.inputs[0]) continue;
				edges.push({
					id: createId('edge'),
					source: nodes[index].id,
					target: nodes[index + 1].id,
					sourceHandle: sourceDef.outputs[0].id,
					targetHandle: targetDef.inputs[0].id,
				});
			}
			return {
				...next,
				workflow: { ...next.workflow, name: action.name, savingState: 'dirty' },
				nodes,
				edges,
				ui: { ...next.ui, selectedNodeId: nodes[0]?.id ?? null },
			};
		}
		case 'MOVE_NODE': {
			const next = withHistory(state);
			return {
				...next,
				nodes: next.nodes.map((node) =>
					node.id === action.id ? { ...node, position: action.position } : node,
				),
			};
		}
		case 'SELECT_NODE':
			return {
				...state,
				ui: { ...state.ui, selectedNodeId: action.id },
			};
		case 'UPDATE_NODE_VALUE':
			return {
				...state,
				workflow: { ...state.workflow, savingState: 'dirty', updatedAt: Date.now() },
				nodes: state.nodes.map((node) =>
					node.id === action.id
						? {
								...node,
								data: {
									...node.data,
									values: {
										...node.data.values,
										[action.fieldKey]: action.value,
									},
								},
							}
						: node,
				),
			};
		case 'RENAME_NODE':
			return {
				...state,
				workflow: { ...state.workflow, savingState: 'dirty', updatedAt: Date.now() },
				nodes: state.nodes.map((node) =>
					node.id === action.id
						? { ...node, data: { ...node.data, label: action.label } }
						: node,
				),
			};
		case 'DELETE_SELECTED': {
			const id = state.ui.selectedNodeId;
			if (!id) return state;
			const next = withHistory(state);
			return {
				...next,
				nodes: next.nodes.filter((node) => node.id !== id),
				edges: next.edges.filter((edge) => edge.source !== id && edge.target !== id),
				ui: { ...next.ui, selectedNodeId: null },
			};
		}
		case 'DUPLICATE_SELECTED': {
			const node = state.nodes.find((item) => item.id === state.ui.selectedNodeId);
			if (!node) return state;
			const clone: TCanvasNode = {
				...structuredClone(node),
				id: createId('node'),
				position: { x: node.position.x + 32, y: node.position.y + 32 },
			};
			const next = withHistory(state);
			return {
				...next,
				nodes: [...next.nodes, clone],
				ui: { ...next.ui, selectedNodeId: clone.id },
			};
		}
		case 'ADD_EDGE': {
			if (action.source === action.target) return state;
			const exists = state.edges.some(
				(edge) =>
					edge.source === action.source &&
					edge.target === action.target &&
					edge.sourceHandle === action.sourceHandle &&
					edge.targetHandle === action.targetHandle,
			);
			if (exists) return state;
			const next = withHistory(state);
			return {
				...next,
				edges: [
					...next.edges,
					{
						id: createId('edge'),
						source: action.source,
						target: action.target,
						sourceHandle: action.sourceHandle,
						targetHandle: action.targetHandle,
					},
				],
			};
		}
		case 'REMOVE_EDGE': {
			const next = withHistory(state);
			return { ...next, edges: next.edges.filter((edge) => edge.id !== action.id) };
		}
		case 'AUTO_LAYOUT': {
			const next = withHistory(state);
			return { ...next, nodes: autoLayout(next.nodes, next.edges) };
		}
		case 'UNDO': {
			const previous = state.history.past[state.history.past.length - 1];
			if (!previous) return state;
			return {
				...state,
				nodes: previous.nodes,
				edges: previous.edges,
				workflow: { ...state.workflow, savingState: 'dirty' },
				history: {
					past: state.history.past.slice(0, -1),
					future: [snapshot(state), ...state.history.future],
				},
			};
		}
		case 'REDO': {
			const next = state.history.future[0];
			if (!next) return state;
			return {
				...state,
				nodes: next.nodes,
				edges: next.edges,
				workflow: { ...state.workflow, savingState: 'dirty' },
				history: {
					past: [...state.history.past, snapshot(state)],
					future: state.history.future.slice(1),
				},
			};
		}
		case 'SET_WORKFLOW_META':
			return {
				...state,
				workflow: { ...state.workflow, ...action.patch, updatedAt: Date.now() },
			};
		case 'SET_SAVE_STATE':
			return { ...state, workflow: { ...state.workflow, savingState: action.savingState } };
		case 'TOGGLE_LEFT_PANEL': {
			const willBeOpen = !state.ui.leftPanelOpen;
			return {
				...state,
				ui: {
					...state.ui,
					leftPanelOpen: willBeOpen,
					aiPanelOpen: willBeOpen ? false : state.ui.aiPanelOpen,
				},
			};
		}
		case 'TOGGLE_RUN_PANEL':
			return { ...state, ui: { ...state.ui, runPanelOpen: !state.ui.runPanelOpen } };
		case 'TOGGLE_AI_PANEL': {
			const willBeOpen = !state.ui.aiPanelOpen;
			return {
				...state,
				ui: {
					...state.ui,
					aiPanelOpen: willBeOpen,
					leftPanelOpen: willBeOpen ? false : state.ui.leftPanelOpen,
				},
			};
		}
		case 'TOGGLE_MINIMAP':
			return { ...state, ui: { ...state.ui, miniMapOpen: !state.ui.miniMapOpen } };
		case 'SET_EMPTY_CANVAS_VIEW':
			return { ...state, ui: { ...state.ui, emptyCanvasView: action.view } };
		case 'SET_COMMAND_PALETTE':
			return { ...state, ui: { ...state.ui, commandPaletteOpen: action.open } };
		case 'SET_QUICK_ADD':
			return { ...state, ui: { ...state.ui, quickAddOpen: action.open } };
		case 'SET_IMPORT_EXPORT':
			return { ...state, ui: { ...state.ui, importExportOpen: action.open } };
		case 'RUN_START':
			return {
				...state,
				run: {
					id: action.id,
					status: 'running',
					startedAt: Date.now(),
					finishedAt: null,
					currentNodeId: null,
					logs: [],
				},
				ui: { ...state.ui, runPanelOpen: true },
			};
		case 'RUN_FINISH':
			return {
				...state,
				run: {
					...state.run,
					status: action.status,
					currentNodeId: null,
					finishedAt: Date.now(),
				},
			};
		case 'RUN_CURRENT_NODE':
			return { ...state, run: { ...state.run, currentNodeId: action.nodeId } };
		case 'APPEND_LOG':
			return {
				...state,
				run: {
					...state.run,
					logs: [
						...state.run.logs,
						{ ...action.log, id: createId('log'), at: Date.now() },
					],
				},
			};
		case 'SET_LOGS':
			return {
				...state,
				run: {
					...state.run,
					logs: action.logs,
				},
			};
		case 'SET_NODE_STATUS':
			return {
				...state,
				nodes: state.nodes.map((node) =>
					node.id === action.id
						? {
								...node,
								data: {
									...node.data,
									status: action.status,
									durationMs: action.durationMs,
									error: action.error,
									outputPreview: action.outputPreview,
								},
							}
						: node,
				),
			};
		case 'LOAD_WORKFLOW':
			return {
				...state,
				workflow: { ...action.workflow.workflow, savingState: 'saved' },
				nodes: action.workflow.nodes,
				edges: action.workflow.edges,
				history: { past: [], future: [] },
				ui: { ...state.ui, selectedNodeId: null, importExportOpen: false },
			};
		case 'SET_NODE_COLOR': {
			const next = withHistory(state);
			return {
				...next,
				nodes: next.nodes.map((node) =>
					node.id === action.id
						? { ...node, data: { ...node.data, color: action.color ?? undefined } }
						: node,
				),
			};
		}
		case 'TOGGLE_NODE_BREAKPOINT':
			return {
				...state,
				nodes: state.nodes.map((node) =>
					node.id === action.id
						? { ...node, data: { ...node.data, breakpoint: !node.data.breakpoint } }
						: node,
				),
			};
		case 'ADD_NODE_COMMENT': {
			const comment: TNodeComment = {
				id: createId('cmt'),
				text: action.text,
				at: Date.now(),
			};
			return {
				...state,
				nodes: state.nodes.map((node) =>
					node.id === action.id
						? {
								...node,
								data: {
									...node.data,
									comments: [...(node.data.comments ?? []), comment],
								},
							}
						: node,
				),
			};
		}
		case 'REMOVE_NODE_COMMENT':
			return {
				...state,
				nodes: state.nodes.map((node) =>
					node.id === action.id
						? {
								...node,
								data: {
									...node.data,
									comments: (node.data.comments ?? []).filter(
										(c) => c.id !== action.commentId,
									),
								},
							}
						: node,
				),
			};
		case 'SET_NODE_TEST_STATUS':
			return {
				...state,
				nodes: state.nodes.map((node) =>
					node.id === action.id
						? {
								...node,
								data: {
									...node.data,
									testStatus: action.status,
									testOutput: action.output,
								},
							}
						: node,
				),
			};
		case 'SET_SHORTCUTS_OPEN':
			return { ...state, ui: { ...state.ui, shortcutsOpen: action.open } };
		case 'SET_CANVAS_SEARCH':
			return {
				...state,
				ui: {
					...state.ui,
					canvasSearchOpen: action.open ?? state.ui.canvasSearchOpen,
					canvasSearchQuery: action.query ?? state.ui.canvasSearchQuery,
				},
			};
		case 'SET_TEMPLATE_LIBRARY':
			return { ...state, ui: { ...state.ui, templateLibraryOpen: action.open } };
		case 'SET_NODE_DOC':
			return {
				...state,
				ui: {
					...state.ui,
					nodeDocOpen: action.open,
					nodeDocNodeId: action.nodeId ?? state.ui.nodeDocNodeId,
				},
			};
		case 'SET_DIFF_VIEWER':
			return { ...state, ui: { ...state.ui, diffViewerOpen: action.open } };
		case 'SET_STEP_MODE':
			return {
				...state,
				ui: { ...state.ui, stepMode: action.enabled, waitingForStep: false },
			};
		case 'STEP_NEXT':
			return { ...state, ui: { ...state.ui, waitingForStep: false } };
		case 'SET_LINK_CREDENTIALS_OPEN':
			return { ...state, ui: { ...state.ui, linkCredentialsOpen: action.open } };
		default:
			return state;
	}
};
