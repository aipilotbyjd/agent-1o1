import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
	AlertCircle,
	Folder,
	Info,
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
	ChevronDown,
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
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.google_sheets': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.google_calendar': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.gmail': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.slack_message': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.teams_message': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.time': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.webhook': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.google_form_responses': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.hubspot_list': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	},
	'trigger.airtable_reader': {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
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

const TriggerNode = ({ data, selected }: NodeProps<TCanvasNode>) => {
	const def = getNodeDefinition(data.defKey, data.definition);
	const hasError = def?.requiresCredential ?? false;
	const brand = brandNameMap[data.defKey] || 'Trigger';
	const colorInfo = colorMap[data.defKey] || {
		bg: 'bg-violet-50/30',
		text: 'text-violet-600',
		iconBg: 'bg-violet-100',
		border: 'border-violet-200',
		darkBorder: 'dark:border-violet-900/40',
	};
	const NodeIcon = iconMap[data.defKey] || Webhook;

	const { dispatch } = useWorkflowEditor();
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
					? 'border-violet-500 ring-4 shadow-violet-100/50 ring-violet-500/10 dark:border-violet-500 dark:shadow-none'
					: 'border-zinc-200 dark:border-zinc-800',
			].join(' ')}>
			{/* Top Bar */}
			<div className='flex items-center justify-between px-3 py-2'>
				<div className='flex items-center gap-1 text-[11px] font-bold text-zinc-500'>
					Activate as flow trigger <Info size={12} className='text-zinc-400' />
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
								? 'justify-end bg-violet-600'
								: 'justify-start bg-zinc-200 dark:bg-zinc-700',
						].join(' ')}>
						<div className='h-3 w-3 animate-none rounded-full bg-white shadow-xs' />
					</button>
				</div>
			</div>

			{/* Error Block */}
			{hasError && (
				<div className='border-b border-red-100 bg-[#fff6f5] px-3 pt-1 pb-3 dark:border-red-900/30 dark:bg-red-950/20'>
					<div className='flex flex-col gap-1.5'>
						<div className='flex items-center gap-1.5 text-[11px] font-bold text-red-500'>
							<AlertCircle size={13} />
							Missing credential(s) or scope(s)
						</div>
						<div className='text-[10px] leading-tight text-red-500/80'>
							This node may not work properly until you authenticate, switch
							credentials or attain the right scopes.
						</div>
						<button
							type='button'
							className='border-zinc-250 mt-1 flex cursor-pointer items-center gap-1.5 self-start rounded-md border bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-600 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-violet-400'>
							Authenticate credentials
						</button>
					</div>
				</div>
			)}

			{/* Main Content Area */}
			<div className={`${colorInfo.bg} rounded-b-lg p-3 dark:bg-zinc-900/10`}>
				{/* Header */}
				<div className='flex items-start gap-3'>
					{/* Icon Box */}
					<div
						className={`h-12 w-12 ${colorInfo.iconBg} flex shrink-0 items-center justify-center rounded-xl dark:bg-violet-950/40 ${colorInfo.text} dark:text-violet-400`}>
						<NodeIcon size={22} strokeWidth={2.5} />
					</div>

					<div className='min-w-0 flex-1'>
						<div className='mb-0.5 flex items-center justify-between'>
							<div className='flex items-center gap-1'>
								<NodeIcon size={10} className={`${colorInfo.text}`} />
								<span className='text-zinc-650 dark:text-zinc-450 text-[10px] font-bold'>
									{brand}
								</span>
								<Info size={10} className='text-violet-500' />
							</div>
							<div className='flex items-center gap-1.5'>
								<span className='text-[10px] font-bold text-violet-600 dark:text-violet-400'>
									Loop Mode
								</span>
								<div className='flex h-4 w-7 cursor-pointer items-center rounded-full border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800'>
									<div className='h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600' />
								</div>
							</div>
						</div>
						<div className='text-[15px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
							{data.label || def?.label || 'Trigger'}
						</div>
					</div>
				</div>

				<div className='mt-2 text-[10px] leading-tight text-zinc-500 dark:text-zinc-400'>
					{def?.description}
				</div>

				{/* Inputs Section */}
				<div className='mt-4 flex flex-col gap-3'>
					{def?.fields.map((field) => {
						if (field.kind === 'toggle') {
							return (
								<div key={field.key} className='flex items-center justify-between'>
									<div className='flex items-center gap-1'>
										<span className='text-[11px] font-bold text-zinc-800 dark:text-zinc-200'>
											{field.label}
										</span>
										<Info size={11} className='text-zinc-400' />
									</div>
									<div className='flex items-center gap-2'>
										<span className='text-[11px] font-semibold text-zinc-400'>
											No
										</span>
										<div className='flex h-4 w-7 cursor-pointer items-center rounded-full bg-zinc-200 p-0.5'>
											<div className='h-3 w-3 rounded-full bg-white shadow-xs' />
										</div>
									</div>
								</div>
							);
						}

						if (field.key === 'folder' || field.key === 'form') {
							const isFolder = field.key === 'folder';
							return (
								<div key={field.key}>
									<div className='mb-1.5 flex items-center gap-1'>
										<span className='text-[11px] font-bold text-zinc-800 dark:text-zinc-200'>
											{field.label}
										</span>
										<Info size={11} className='text-zinc-400' />
									</div>
									<button
										type='button'
										className='flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white py-1.5 text-[11px] font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
										<span className='mr-0.5 font-extrabold text-blue-500'>
											G
										</span>{' '}
										{isFolder ? 'Pick Folder' : 'Pick File'}
									</button>
								</div>
							);
						}

						if (field.kind === 'select') {
							return (
								<div key={field.key}>
									<div className='mb-1.5 flex items-center gap-1'>
										<span className='text-[11px] font-bold text-zinc-800 dark:text-zinc-200'>
											{field.label}
										</span>
										<Info size={11} className='text-zinc-400' />
									</div>
									<div className='relative'>
										<select
											className='text-zinc-750 w-full cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium shadow-xs outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
											defaultValue=''>
											<option value='' disabled>
												{field.placeholder ?? 'Select an option'}
											</option>
											{field.options?.map((opt) => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
										<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500'>
											<ChevronDown size={12} />
										</div>
									</div>
								</div>
							);
						}

						const val =
							data.values?.[field.key] !== undefined
								? String(data.values[field.key])
								: field.default !== undefined
									? String(field.default)
									: '';

						return (
							<div key={field.key}>
								<div className='mb-1.5 flex items-center gap-1'>
									<span className='text-[11px] font-bold text-zinc-800 dark:text-zinc-200'>
										{field.label}
									</span>
									<Info size={11} className='text-zinc-400' />
								</div>
								<input
									type='text'
									readOnly
									value={val}
									className='text-zinc-750 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium shadow-xs outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
									placeholder={field.placeholder ?? `Enter ${field.label}...`}
								/>
							</div>
						);
					})}

					<button
						type='button'
						className='mt-1 flex cursor-pointer items-center gap-1.5 self-start rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'>
						<svg
							width='10'
							height='10'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<rect x='3' y='3' width='18' height='18' rx='2' ry='2'></rect>
							<line x1='9' y1='9' x2='15' y2='15'></line>
							<line x1='15' y1='9' x2='9' y2='15'></line>
						</svg>
						Show More Options
					</button>

					{!!triggerDetail && (
						<div className='mt-3.5 flex flex-col gap-2 border-t border-violet-100 pt-3 dark:border-violet-900/30'>
							{(triggerDetail as any).webhook_url && (
								<div className='flex flex-col gap-1'>
									<span className='text-[10px] font-bold text-violet-600 dark:text-violet-400'>
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
			</div>

			{/* Number Badge at Bottom */}
			<div className='border-violet-205 dark:border-violet-850 absolute -bottom-3 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white text-[10px] font-bold text-violet-600 shadow-xs dark:bg-zinc-900 dark:text-violet-400'>
				1
			</div>

			{/* Input Handle */}
			{def?.inputs && def.inputs.length > 0 && (
				<Handle
					id={def.inputs[0].id}
					type='target'
					position={Position.Left}
					style={{
						top: '50%',
						backgroundColor: '#8b5cf6',
						borderColor: 'rgba(139, 92, 246, 0.3)',
						borderWidth: 2,
						height: 12,
						width: 12,
						left: -6,
					}}
					className='transition-transform duration-150 hover:scale-125'
				/>
			)}

			{/* Output Handle */}
			{def?.outputs[0] && (
				<Handle
					id={def.outputs[0].id}
					type='source'
					position={Position.Right}
					style={{
						top: '50%',
						backgroundColor: '#8b5cf6',
						borderColor: 'rgba(139, 92, 246, 0.3)',
						borderWidth: 2,
						height: 12,
						width: 12,
						right: -6,
					}}
					className='transition-transform duration-150 hover:scale-125'
				/>
			)}

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

			{selected && data.defKey === 'trigger.google_calendar' && (
				<>
					{/* Input Card */}
					<div className='absolute left-[360px] top-0 w-[200px] border border-dashed border-zinc-200 bg-zinc-50/70 p-3 rounded-2xl text-zinc-500 flex flex-col gap-1 z-10 dark:border-zinc-800 dark:bg-zinc-900/30 pointer-events-auto shadow-xs'>
						<div className='text-[11px] font-bold text-zinc-700 dark:text-zinc-300'>Connect an input</div>
						<div className='text-[9px] leading-normal text-zinc-450 dark:text-zinc-500 font-medium'>
							Drag outputs from other nodes to use them in this node.
						</div>
					</div>

					{/* Output Card */}
					<div className='absolute left-[360px] top-[95px] w-[200px] border border-zinc-200 bg-white p-3 rounded-2xl text-zinc-700 flex flex-col gap-2 z-10 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm pointer-events-auto'>
						<div className='flex items-center justify-between'>
							<span className='text-[11px] font-bold text-zinc-800 dark:text-white'>11 Outputs</span>
							<Info size={11} className='text-zinc-400' />
						</div>
						<div className='flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1'>
							{[
								'Event Ids List',
								'Event Names List',
								'Event Start Times List',
								'Event End Times List',
								'Event Durations List'
							].map((name) => (
								<div key={name} className='flex items-center justify-between bg-blue-50/50 border border-blue-100/40 rounded-lg px-2.5 py-1.5 text-[9px] font-bold text-blue-650 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'>
									<span>{name}</span>
									<svg className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
								</div>
							))}
						</div>
					</div>
				</>
			)}
		</motion.div>
	);
};

export default TriggerNode;
