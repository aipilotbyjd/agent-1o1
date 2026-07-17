import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
	Folder,
	FileSpreadsheet,
	Calendar,
	Mail,
	MessageSquare,
	Users,
	Clock,
	Webhook,
	FileText,
	Layers,
	Database,
	ChevronsDownUp,
	ChevronsUpDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { TCanvasNode } from '../../../_types/canvas.type';
import { getNodeDefinition } from '../../../_helper/nodeCatalog.constants';
import {
	useWorkflowTrigger,
	useCreateWorkflowWebhook,
	useCreateWorkflowPollingTrigger,
	usePauseWorkflowTrigger,
	useDeleteWorkflowTrigger,
	useWorkflowTriggerDetail,
	useResumeWorkflowTrigger,
} from '@/api/modules/workflows/workflows.hooks';
import { useWorkflowRouteParams } from '../../../_hooks/useWorkflowRouteParams.hook';
import { useWorkflowEditor } from '../../../_context/WorkflowEditorProvider.context';
import { useMemo } from 'react';
import NodeFields from './NodeFields.partial';
import { PortHandles } from './BaseNode.partial';
import NodeToolbar from './NodeToolbar.partial';
import NodeIOPanel from './NodeIOPanel.partial';
import NodeLoopToggle from './NodeLoopToggle.partial';
import NodeAuthWarning from './NodeAuthWarning.partial';
import NodeHelpTip from './NodeHelpTip.partial';

const iconMap: Record<
	string,
	React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
> = {
	'trigger.google_drive': Folder,
	'trigger.google_sheets': FileSpreadsheet,
	'trigger.google_calendar': Calendar,
	'trigger.gmail': Mail,
	'trigger.slack_message': MessageSquare,
	'trigger.teams_message': Users,
	'trigger.time': Clock,
	'trigger.webhook': Webhook,
	'trigger.google_form_responses': FileText,
	'trigger.hubspot_list': Layers,
	'trigger.airtable_reader': Database,
	'trigger.zendesk_ticket': FileText,
	'trigger.linear_issue': FileText,
	'trigger.jira_issue': FileText,
	'trigger.typeform_submission': FileText,
	'trigger.incident_io': FileText,
	'trigger.parallel_web_monitor': FileText,
};

const colorMap: Record<
	string,
	{ bg: string; text: string; iconBg: string; border: string; darkBorder: string }
> = {
	'trigger.google_drive': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.google_sheets': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.google_calendar': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.gmail': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.slack_message': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.teams_message': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.time': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.webhook': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.google_form_responses': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.hubspot_list': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
	'trigger.airtable_reader': {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	},
};

const brandNameMap: Record<string, string> = {
	'trigger.google_drive': 'Google Drive',
	'trigger.google_sheets': 'Google Sheets',
	'trigger.google_calendar': 'Google Calendar',
	'trigger.gmail': 'Gmail',
	'trigger.slack_message': 'Slack',
	'trigger.teams_message': 'Teams',
	'trigger.time': 'Schedule',
	'trigger.webhook': 'Webhook',
	'trigger.google_form_responses': 'Google Forms',
	'trigger.hubspot_list': 'HubSpot',
	'trigger.airtable_reader': 'Airtable',
};

const TriggerNode = ({ id, data, selected }: NodeProps<TCanvasNode>) => {
	const { state, dispatch } = useWorkflowEditor();
	const def = getNodeDefinition(data.defKey, data.definition);
	const hasIncoming = state.edges.some((edge) => edge.target === id);
	const nodeIndex = state.nodes.findIndex((node) => node.id === id) + 1;
	const collapsed = Boolean(data.collapsed);
	const hasError = Boolean(def?.requiresCredential) && !data.values.credential_id;
	const brand = brandNameMap[data.defKey] || 'Trigger';
	const colorInfo = colorMap[data.defKey] || {
		bg: 'bg-primary-50/30',
		text: 'text-primary-600',
		iconBg: 'bg-primary-100',
		border: 'border-primary-200',
		darkBorder: 'dark:border-primary-900/40',
	};
	const NodeIcon = iconMap[data.defKey] || Webhook;

	const { workspaceId, workflowId } = useWorkflowRouteParams();
	const { data: triggerData } = useWorkflowTrigger(workspaceId, workflowId);

	const createWebhook = useCreateWorkflowWebhook(workspaceId);
	const createPolling = useCreateWorkflowPollingTrigger(workspaceId);
	const pauseTrigger = usePauseWorkflowTrigger(workspaceId);
	const deleteTrigger = useDeleteWorkflowTrigger(workspaceId);
	const resumeTrigger = useResumeWorkflowTrigger(workspaceId);

	const isTriggerActive = useMemo(() => {
		if (!triggerData) return false;
		if (Array.isArray(triggerData)) {
			return (
				triggerData.length > 0 &&
				triggerData[0]?.status !== 'paused' &&
				triggerData[0]?.is_active !== false
			);
		}
		return (
			(triggerData as any)?.status !== 'paused' && (triggerData as any)?.is_active !== false
		);
	}, [triggerData]);

	const triggerId = useMemo(() => {
		if (!triggerData) return '';
		return Array.isArray(triggerData)
			? String(triggerData[0]?.id ?? '')
			: String((triggerData as any)?.id ?? '');
	}, [triggerData]);

	const { data: triggerDetail } = useWorkflowTriggerDetail(workspaceId, workflowId, triggerId);

	return (
		<motion.div
			whileHover={{ y: -2 }}
			transition={{ duration: 0.16 }}
			className={[
				'relative w-[340px] rounded-xl border-2 p-1 text-left shadow-2xl transition-all duration-200',
				'bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100',
				selected
					? 'border-primary-500 ring-4 shadow-primary-500/50 ring-primary-500/10 dark:border-primary-500 dark:shadow-none'
					: 'border-zinc-200 dark:border-zinc-800',
			].join(' ')}>
			{/* Top Bar */}
			<div className='flex items-center justify-between px-3 py-2'>
				<div className='flex items-center gap-1 text-[11px] font-bold text-zinc-500'>
					Activate as flow trigger{' '}
					<NodeHelpTip
						size={12}
						text='When on, this node starts the workflow automatically on incoming events instead of waiting for a manual run.'
					/>
				</div>
				<div className='flex items-center gap-2'>
					<span className='text-[11px] font-semibold text-zinc-400'>
						{isTriggerActive ? 'Yes' : 'No'}
					</span>
					<button
						type='button'
						aria-label='Toggle flow trigger'
						onClick={() => {
							if (!workspaceId || !workflowId) return;
							if (isTriggerActive) {
								const triggerId =
									(triggerData as any)?.id ??
									(Array.isArray(triggerData) ? triggerData[0]?.id : null);
								if (triggerId) {
									pauseTrigger.mutate({ workflowId, triggerId });
								}
							} else {
								const triggerId =
									(triggerData as any)?.id ??
									(Array.isArray(triggerData) ? triggerData[0]?.id : null);
								if (triggerId) {
									resumeTrigger.mutate({ workflowId, triggerId });
								} else {
									if (
										data.defKey.includes('time') ||
										data.defKey.includes('schedule')
									) {
										createPolling.mutate({ id: workflowId });
									} else {
										createWebhook.mutate({ id: workflowId });
									}
								}
							}
						}}
						disabled={
							createWebhook.isPending ||
							createPolling.isPending ||
							pauseTrigger.isPending ||
							resumeTrigger.isPending ||
							deleteTrigger.isPending
						}
						className={[
							'flex h-4 w-7 cursor-pointer items-center rounded-full p-0.5 transition-all duration-200',
							isTriggerActive
								? 'justify-end bg-primary-400'
								: 'justify-start bg-zinc-200 dark:bg-zinc-700',
						].join(' ')}>
						<div className='h-3 w-3 animate-none rounded-full bg-white shadow-xs' />
					</button>
				</div>
			</div>

			{hasError && <NodeAuthWarning />}

			{/* Main Content Area */}
			<div className={`${colorInfo.bg} rounded-b-lg p-3 dark:bg-zinc-900/10`}>
				{/* Header */}
				<div className='flex items-start gap-3'>
					{/* Icon Box */}
					<div
						className={`h-12 w-12 ${colorInfo.iconBg} flex shrink-0 items-center justify-center rounded-xl dark:bg-primary-950/40 ${colorInfo.text} dark:text-primary-400`}>
						<NodeIcon size={22} strokeWidth={2.5} />
					</div>

					<div className='min-w-0 flex-1'>
						<div className='mb-0.5 flex items-center justify-between'>
							<div className='flex items-center gap-1'>
								<NodeIcon size={10} className={`${colorInfo.text}`} />
								<span className='text-zinc-650 dark:text-zinc-450 text-[10px] font-bold'>
									{brand}
								</span>
								{def?.description && (
								<NodeHelpTip
									size={10}
									text={def.description}
									className='text-primary-500'
								/>
							)}
							</div>
							<div className='flex items-center gap-2'>
								{def?.supportsLoopMode && (
									<NodeLoopToggle nodeId={id} active={Boolean(data.loopMode)} />
								)}
								<button
									type='button'
									title={collapsed ? 'Expand node' : 'Collapse node'}
									onPointerDown={(event) => event.stopPropagation()}
									onClick={(event) => {
										event.stopPropagation();
										dispatch({ type: 'TOGGLE_NODE_COLLAPSED', id });
									}}
									className='nodrag text-zinc-400 transition hover:text-primary-500'>
									{collapsed ? (
										<ChevronsUpDown size={12} />
									) : (
										<ChevronsDownUp size={12} />
									)}
								</button>
							</div>
						</div>
						<div className='text-[15px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
							{data.label || def?.label || 'Trigger'}
						</div>
					</div>
				</div>

				{!collapsed && (
					<div className='mt-2 text-[10px] leading-tight text-zinc-500 dark:text-zinc-400'>
						{def?.description}
					</div>
				)}

				{!collapsed && def && def.fields.length > 0 && (
					<div className='mt-4'>
						<NodeFields nodeId={id} fields={def.fields} values={data.values} />
					</div>
				)}
					{!!triggerDetail && (
						<div className='mt-3.5 flex flex-col gap-2 border-t border-primary-100 pt-3 dark:border-primary-900/30'>
							{(triggerDetail as any).webhook_url && (
								<div className='flex flex-col gap-1'>
									<span className='text-[10px] font-bold text-primary-600 dark:text-primary-400'>
										Webhook URL:
									</span>
									<span className='cursor-text rounded-lg border border-zinc-200 bg-white p-1.5 font-mono text-[9px] font-semibold break-all text-zinc-700 select-all select-text dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'>
										{(triggerDetail as any).webhook_url}
									</span>
								</div>
							)}
							<div className='mt-1 flex items-center justify-between'>
								<div
									className={`flex items-center gap-1.5 text-[10px] font-bold ${isTriggerActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
									<span
										className={`h-1.5 w-1.5 rounded-full ${isTriggerActive ? 'animate-pulse bg-emerald-500' : 'bg-zinc-350 dark:bg-zinc-650'}`}
									/>
									<span>
										{isTriggerActive
											? 'Listening for events...'
											: 'Trigger paused'}
									</span>
								</div>
								<button
									type='button'
									onClick={() => {
										if (triggerId) {
											deleteTrigger.mutate({ workflowId, triggerId });
										}
									}}
									disabled={deleteTrigger.isPending}
									className='dark:hover:text-rose-450 cursor-pointer text-[9px] font-bold text-rose-500 hover:text-rose-600'>
									Delete Configuration
								</button>
							</div>
						</div>
					)}
				</div>

			{/* Input Handle */}
			{def && (
				<Handle
					id={def.inputs && def.inputs.length > 0 ? def.inputs[0].id : 'in'}
					type='target'
					position={Position.Top}
					style={{
						left: 'calc(50% - 12px)',
						top: -12,
						backgroundColor: 'white',
						borderColor: '#8b5cf6',
						borderWidth: 2,
						height: 24,
						width: 24,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 10,
						fontWeight: 'bold',
						color: '#8b5cf6',
						zIndex: 10,
					}}
					className='transition-transform duration-150 hover:scale-110 shadow-sm rounded-full cursor-crosshair dark:bg-zinc-900 dark:border-zinc-800'
				>
					<span className='pointer-events-none'>1</span>
				</Handle>
			)}

			{/* Output Handles */}
			{def && (
				<PortHandles ports={def.outputs ?? []} type='source' color='#8b5cf6' />
			)}

			{/* Node index badge */}
			<div className='absolute -bottom-3 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-[10px] font-bold text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'>
				{nodeIndex}
			</div>

			{selected && (
				<NodeToolbar
					nodeId={id}
					defKey={data.defKey}
					label={data.label || def?.label || 'Trigger'}
					fields={def?.fields ?? []}
				/>
			)}

			{selected && def && (
				<NodeIOPanel
					inputs={def.inputs ?? []}
					outputs={def.outputs ?? []}
					hasIncoming={hasIncoming}
				/>
			)}

		</motion.div>
	);
};

export default TriggerNode;
