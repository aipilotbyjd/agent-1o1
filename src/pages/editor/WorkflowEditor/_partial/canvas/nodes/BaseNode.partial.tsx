import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
	AlertCircle,
	Bot,
	Braces,
	CheckCircle2,
	Circle,
	Clock3,
	Database,
	GitBranch,
	Globe2,
	Info,
	Loader2,
	Maximize2,
	MessageSquare,
	OctagonX,
	Pin,
	TriangleAlert,
	Webhook,
	Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getNodeDefinition } from '../../../_helper/nodeCatalog.constants';
import ApiNodeIcon from '../../library/NodeIcon.partial';
import NodeFields from './NodeFields.partial';
import NodeColorPicker from './NodeColorPicker.partial';
import NodeCommentsPanel from './NodeCommentsPanel.partial';
import NodeInlineTest from './NodeInlineTest.partial';
import NodeRunIO from './NodeRunIO.partial';
import { tintStyle } from '../../library/library.util';
import { PORT_TYPE_COLOR } from '../../../_helper/builder.constants';
import { useWorkflowEditor } from '../../../_context/WorkflowEditorProvider.context';
import type { TCanvasNode } from '../../../_types/canvas.type';
import type { TNodeComment, TNodePort } from '../../../_types/node.type';
import type { TValidationIssue } from '../../../_helper/validation.helper';

const getPortTop = (index: number, total: number) => `${((index + 1) * 100) / (total + 1)}%`;

const iconMap = {
	'trigger.webhook': Webhook,
	'ai.agent': Bot,
	'ai.chat': MessageSquare,
	'ai.extract': Braces,
	'data.http': Globe2,
	'data.database': Database,
	'logic.condition': GitBranch,
	'logic.if': GitBranch,
	'utility.delay': Clock3,
	'output.display': Zap,
};

const statusClass: Record<string, string> = {
	idle: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
	queued: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
	running: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
	success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
	error: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
	skipped: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
};

/** Map durationMs → profiler gradient color */
const profilerColor = (ms?: number): string => {
	if (ms === undefined) return '';
	if (ms < 200) return 'rgba(16,185,129,0.12)';
	if (ms < 800) return 'rgba(245,158,11,0.12)';
	return 'rgba(244,63,94,0.12)';
};

export const PortHandles = ({
	ports,
	type,
	color,
}: {
	ports: TNodePort[];
	type: 'source' | 'target';
	color?: string;
}) => {
	const position = type === 'source' ? Position.Bottom : Position.Top;
	const getPortLeft = (index: number, total: number) => `${((index + 1) * 100) / (total + 1)}%`;
	return (
		<>
			{ports.map((port, index) => (
				<Handle
					key={port.id}
					id={port.id}
					type={type}
					position={position}
					title={`${port.name}: ${port.type}`}
					style={{
						left: `calc(${getPortLeft(index, ports.length)} - 12px)`,
						bottom: type === 'source' ? -12 : undefined,
						top: type === 'target' ? -12 : undefined,
						width: 24,
						height: 24,
						backgroundColor: 'white',
						borderWidth: 2,
						borderColor: color ?? '#d4d4d8',
						color: color ?? '#71717a',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 10,
						fontWeight: 'bold',
						zIndex: 10,
					}}
					className='transition-transform duration-150 hover:scale-110 shadow-sm rounded-full cursor-crosshair dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700'
				>
					<span className='pointer-events-none'>{(index + 1).toString()}</span>
				</Handle>
			))}
		</>
	);
};

const BaseNode = ({ id, data, selected }: NodeProps<TCanvasNode>) => {
	const { dispatch } = useWorkflowEditor();
	const def = getNodeDefinition(data.defKey, data.definition);
	const status = data.status ?? 'idle';
	const inputs = def?.inputs && def.inputs.length > 0 ? def.inputs : [{ id: 'in', name: 'input', type: 'any' as const }];
	const outputs = def?.outputs && def.outputs.length > 0 ? def.outputs : [{ id: 'out', name: 'output', type: 'any' as const }];
	const validationIssues = (data.validationIssues ?? []) as TValidationIssue[];
	const hasError =
		status === 'error' || validationIssues.some((issue) => issue.severity === 'error');
	const hasWarning = validationIssues.length > 0;
	const isActiveRunNode = Boolean(data.isActiveRunNode);
	const comments = (data.comments ?? []) as TNodeComment[];

	const NodeIcon = iconMap[data.defKey as keyof typeof iconMap];
	const effectiveColorHex = (data.color as string | undefined) ?? def?.colorHex;

	const brand = (def?.key.split('.')[0] ?? def?.category ?? 'node')
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
	const needsAuth = Boolean(def?.requiresCredential) && !data.values.credential_id;

	const durationMs = typeof data.durationMs === 'number' ? data.durationMs : undefined;

	return (
		<motion.div
			whileHover={{ y: -2 }}
			transition={{ duration: 0.16 }}
			className={[
				'group relative w-[340px] rounded-xl border-2 p-1 text-left shadow-2xl transition-all duration-200',
				'bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100',
				selected
					? 'border-primary-500 ring-4 shadow-primary-500/50 ring-primary-500/10 dark:border-primary-500 dark:shadow-none'
					: 'border-zinc-200 dark:border-zinc-800',
				hasError ? 'border-rose-400/80 ring-4 ring-rose-500/10' : '',
				isActiveRunNode ? 'ring-4 shadow-emerald-500/20 ring-emerald-400/20' : '',
				data.breakpoint ? 'ring-2 ring-rose-500/40' : '',
			].join(' ')}
			style={
				data.color
					? { borderColor: data.color, boxShadow: `0 0 0 4px ${data.color}18` }
					: undefined
			}>
			<PortHandles ports={inputs} type='target' color={effectiveColorHex} />

			{/* Breakpoint indicator */}
			{data.breakpoint && (
				<div
					title='Breakpoint set — execution will pause here'
					className='absolute -top-2 -left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-rose-300 bg-rose-500 text-white shadow'>
					<OctagonX size={12} />
				</div>
			)}

			{hasWarning && (
				<div
					title={validationIssues.map((issue) => issue.message).join('\n')}
					className={[
						'absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border shadow transition-transform duration-200 group-hover:scale-110',
						hasError
							? 'border-rose-200 bg-rose-500 text-white'
							: 'border-amber-200 bg-amber-400 text-zinc-950',
					].join(' ')}>
					<TriangleAlert size={14} />
				</div>
			)}

			<div
				className='rounded-lg p-3'
				style={{
					backgroundColor: effectiveColorHex
						? `${effectiveColorHex}0d`
						: durationMs !== undefined
							? profilerColor(durationMs)
							: undefined,
				}}>
				<div className='flex items-start gap-3'>
					<div
						className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl'
						style={tintStyle(effectiveColorHex)}>
						{NodeIcon ? (
							<NodeIcon size={22} strokeWidth={2.5} />
						) : (
							<ApiNodeIcon icon={def?.icon} size={22} />
						)}
					</div>

					<div className='min-w-0 flex-1'>
						<div className='mb-0.5 flex items-center justify-between gap-2'>
							<span className='flex min-w-0 items-center gap-1'>
								<span className='shrink-0' style={{ color: effectiveColorHex }}>
									{NodeIcon ? (
										<NodeIcon size={10} />
									) : (
										<ApiNodeIcon icon={def?.icon} size={10} />
									)}
								</span>
								<span className='truncate text-[10px] font-bold text-zinc-600 dark:text-zinc-300'>
									{brand}
								</span>
								{/* Docs button */}
								<button
									type='button'
									title='View node documentation'
									onClick={(e) => {
										e.stopPropagation();
										dispatch({ type: 'SET_NODE_DOC', open: true, nodeId: id });
									}}
									className='shrink-0 text-zinc-400 transition hover:text-primary-500'>
									<Info size={10} />
								</button>
							</span>
							<span
								className={[
									'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase',
									statusClass[status],
									isActiveRunNode ? 'ring-2 ring-emerald-400/50' : '',
								].join(' ')}>
								{status === 'running' && (
									<Loader2 size={9} className='animate-spin' />
								)}
								{status === 'success' && <CheckCircle2 size={9} />}
								{status}
							</span>
							{data.pinned && (
								<span
									title='Output pinned — reused on re-run'
									className='inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-amber-600 uppercase dark:bg-amber-950/40 dark:text-amber-400'>
									<Pin size={9} />
									Pinned
								</span>
							)}
						</div>
						<div className='text-[15px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
							{data.label || def?.label || 'Node'}
						</div>
					</div>

					{/* Node action buttons — visible on hover */}
					<div className='flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
						<button
							type='button'
							title='Expand node configuration'
							onClick={(e) => {
								e.stopPropagation();
								dispatch({ type: 'SET_NODE_EXPANDED', open: true, nodeId: id });
							}}
							className='flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/40 dark:hover:text-primary-400'>
							<Maximize2 size={14} />
						</button>
						<NodeColorPicker
							nodeId={id}
							currentColor={data.color as string | undefined}
						/>
						<NodeCommentsPanel nodeId={id} comments={comments} />
					</div>
				</div>

				<div className='mt-2 text-[10px] leading-tight text-zinc-500 dark:text-zinc-400'>
					{def?.description}
				</div>

				{needsAuth && (
					<div className='mt-3 rounded-lg border border-red-100 bg-[#fff6f5] p-2.5 dark:border-red-900/30 dark:bg-red-950/20'>
						<div className='flex items-center gap-1.5 text-[11px] font-bold text-red-500'>
							<AlertCircle size={13} />
							Missing credential
						</div>
						<div className='mt-1 text-[10px] leading-tight text-red-500/80'>
							Authenticate or select a credential to use this node.
						</div>
					</div>
				)}

				{def && def.fields.length > 0 && (
					<div className='mt-4'>
						<NodeFields nodeId={id} fields={def.fields} values={data.values} />
					</div>
				)}

				{/* Execution profiler */}
				{durationMs !== undefined && (
					<div className='mt-3 flex items-center gap-1.5'>
						<Circle
							size={8}
							fill={
								durationMs < 200
									? '#10b981'
									: durationMs < 800
										? '#f59e0b'
										: '#f43f5e'
							}
							stroke='none'
						/>
						<span className='truncate text-[10px] font-bold text-zinc-400'>
							Last run {durationMs}ms
						</span>
					</div>
				)}

				{/* Resolved input/output from the last run */}
				<NodeRunIO
					inputPreview={data.inputPreview}
					outputPreview={data.outputPreview}
					pinned={data.pinned}
					pinnedOutput={data.pinnedOutput}
				/>

				{/* Inline node test */}
				{selected && <NodeInlineTest nodeId={id} defKey={data.defKey} def={def ?? null} />}
			</div>



			{isActiveRunNode && (
				<div className='absolute inset-0 -z-10 rounded-xl bg-emerald-400/15 blur-xl' />
			)}
			<PortHandles ports={outputs} type='source' color={effectiveColorHex} />

			{selected && (
				<div className='absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 shadow-md z-50 text-[10px] font-bold text-zinc-600 select-none pointer-events-auto dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 whitespace-nowrap shadow-zinc-200/50 dark:shadow-none'>
					<button type='button' className='flex items-center gap-1 px-1.5 py-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-white'>
						<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
						<span>Duplicate</span>
					</button>
					<button type='button' className='flex items-center gap-1 px-1.5 py-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-white'>
						<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
						<span>Rename</span>
					</button>
					<button type='button' className='flex items-center gap-1 px-1.5 py-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-white'>
						<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
						<span>Configure Inputs</span>
					</button>
					<button type='button' className='flex items-center gap-1 px-1.5 py-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-white'>
						<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						<span>Test</span>
					</button>
					<button type='button' onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_SELECTED' }); }} className='flex items-center gap-1 px-1.5 py-0.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded text-rose-500 hover:text-rose-700'>
						<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
						<span>Delete</span>
					</button>
				</div>
			)}
		</motion.div>
	);
};

export default BaseNode;
