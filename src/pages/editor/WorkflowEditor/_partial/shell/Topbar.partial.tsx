import {
	Bot,
	Play,
	RotateCcw,
	RotateCw,
	Settings2,
	Moon,
	Square,
	Sun,
	LayoutGrid,
	Zap,
	GitBranch,
	Share,
	ChevronDown,
	Save,
	Keyboard,
	GitCompare,
	Library,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import DARK_MODE from '@/constants/darkMode.constant';
import useDarkMode from '@/hooks/useDarkMode';
import { useCreateWorkflowVersion } from '@/api/modules/workflows';
import { useWorkflowEditor } from '../../_context/WorkflowEditorProvider.context';
import { buildVersionPayload } from '../../_helper/workflowApiTransform.helper';
import { useRunWorkflow } from '../../_hooks/useRunWorkflow.hook';
import { useAiChatStore } from '@/store/aiChat.store';

const PurpleOutlineButton = ({
	children,
	onClick,
	disabled,
}: {
	children: ReactNode;
	onClick?: () => void;
	disabled?: boolean;
}) => (
	<button
		type='button'
		onClick={onClick}
		disabled={disabled}
		className='flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-violet-600 shadow-xs transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800/40 dark:bg-zinc-900 dark:text-violet-400 dark:hover:bg-white/[0.04]'>
		{children}
	</button>
);

const IconButton = ({
	title,
	children,
	onClick,
	disabled,
	active,
}: {
	title: string;
	children: ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	active?: boolean;
}) => (
	<button
		type='button'
		title={title}
		aria-label={title}
		onClick={onClick}
		disabled={disabled}
		className={[
			'flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition',
			active
				? 'border-emerald-300/40 bg-emerald-50 text-emerald-700 dark:border-emerald-300/30 dark:bg-emerald-400/15 dark:text-emerald-200'
				: 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-white',
			disabled ? 'cursor-not-allowed opacity-30' : '',
		].join(' ')}>
		{children}
	</button>
);

const Topbar = () => {
	const { state, dispatch } = useWorkflowEditor();
	const { isDarkTheme, setDarkModeStatus } = useDarkMode();
	const { runWorkflow, stopRun } = useRunWorkflow();
	const saveVersion = useCreateWorkflowVersion(state.workflow.workspaceId ?? '');
	const isRunning = state.run.status === 'running';

	const handleSave = () => {
		if (!state.workflow.workspaceId || !state.workflow.apiId) {
			dispatch({ type: 'SET_SAVE_STATE', savingState: 'dirty' });
			return;
		}

		dispatch({ type: 'SET_SAVE_STATE', savingState: 'saving' });
		saveVersion.mutate(
			{
				id: state.workflow.apiId,
				body: buildVersionPayload(state),
			},
			{
				onSuccess: (version) => {
					dispatch({
						type: 'SET_WORKFLOW_META',
						patch: {
							currentVersionId: version.id,
							currentVersionNumber: version.version_number,
							savingState: 'saved',
						},
					});
				},
				onError: () => dispatch({ type: 'SET_SAVE_STATE', savingState: 'error' }),
			},
		);
	};

	const isChatActive = useAiChatStore((store) => store.isChatActive);

	if (isChatActive) {
		return (
			<header className='z-20 flex h-14 w-full shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-white/10 dark:bg-[#07080b] select-none'>
				{/* Left Section: Breadcrumb Title */}
				<div className='flex items-center gap-2'>
					<span className='flex items-center gap-1 text-zinc-400 dark:text-zinc-550 text-sm font-medium'>
						<svg className='h-4 w-4 stroke-current mr-1 text-zinc-500' viewBox='0 0 24 24' fill='none' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
						</svg>
						<span>Pipeline</span>
						<span className='mx-1 text-zinc-300 dark:text-zinc-700'>/</span>
						<span className='font-bold text-zinc-800 dark:text-zinc-100'>Untitled Workflow</span>
					</span>
					<button
						type='button'
						title='Rename Workflow'
						className='flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.05] dark:hover:text-white'
					>
						<svg className='h-3.5 w-3.5 fill-none stroke-current' viewBox='0 0 24 24' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' />
							<path d='M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z' />
						</svg>
					</button>
				</div>

				{/* Right Section: Notification bell with badge dot */}
				<div className='flex items-center gap-3'>
					<button
						type='button'
						title='Notifications'
						className='relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-450 dark:hover:bg-white/[0.05] dark:hover:text-white'
					>
						<svg className='h-5 w-5 fill-none stroke-current' viewBox='0 0 24 24' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' />
							<path d='M10.3 21a1.94 1.94 0 0 0 3.4 0' />
						</svg>
						<span className='absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-[#07080b]' />
					</button>
				</div>
			</header>
		);
	}

	return (
		<header className='z-20 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5 dark:border-white/10 dark:bg-[#07080b]'>
			{/* Left Section: Branding & Navigation */}
			<div className='flex items-center gap-4'>
				<div className='flex items-center gap-2'>
					<span className='flex items-center gap-1.5 text-violet-600 dark:text-violet-400'>
						<Bot size={24} strokeWidth={2.5} />
						<span className='text-base font-extrabold tracking-tight'>agent101</span>
					</span>
					<button
						type='button'
						title='Workspace Settings'
						className='flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.05] dark:hover:text-white'>
						<Settings2 size={15} />
					</button>
				</div>

				<div className='h-6 w-px bg-zinc-200 dark:bg-zinc-800' />

				{/* Add buttons */}
				<div className='flex items-center gap-2'>
					<PurpleOutlineButton>
						<LayoutGrid size={14} className='text-violet-600 dark:text-violet-400' />
						<span>Add Interface</span>
					</PurpleOutlineButton>
					{state.ui.leftPanelOpen ? (
						<button
							type='button'
							onClick={() => dispatch({ type: 'TOGGLE_LEFT_PANEL' })}
							className='dark:bg-violet-750 dark:hover:bg-violet-650 flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-violet-700'>
							<Zap size={14} className='fill-white text-white' />
							<span>Add Trigger</span>
						</button>
					) : (
						<PurpleOutlineButton
							onClick={() => dispatch({ type: 'TOGGLE_LEFT_PANEL' })}>
							<Zap
								size={14}
								className='fill-violet-600 text-violet-600 dark:fill-violet-400 dark:text-violet-400'
							/>
							<span>Add Trigger</span>
						</PurpleOutlineButton>
					)}
					<button
						type='button'
						className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-violet-600 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-800/40 dark:bg-zinc-900 dark:text-violet-400 dark:hover:bg-white/[0.04]'>
						<GitBranch size={15} />
					</button>
				</div>
			</div>

			{/* Right Section: Action Controls */}
			<div className='flex items-center gap-3.5'>
				{/* Undo/Redo & Darkmode */}
				<div className='flex items-center gap-1.5'>
					<IconButton
						title='Undo (⌘Z)'
						onClick={() => dispatch({ type: 'UNDO' })}
						disabled={!state.history.past.length}>
						<RotateCcw size={14} />
					</IconButton>
					<IconButton
						title='Redo (⌘⇧Z)'
						onClick={() => dispatch({ type: 'REDO' })}
						disabled={!state.history.future.length}>
						<RotateCw size={14} />
					</IconButton>
					<IconButton
						title='Version diff (⌘⇧V)'
						onClick={() => dispatch({ type: 'SET_DIFF_VIEWER', open: true })}
						disabled={!state.history.past.length}>
						<GitCompare size={14} />
					</IconButton>
					<IconButton
						title={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
						onClick={() =>
							setDarkModeStatus(isDarkTheme ? DARK_MODE.LIGHT : DARK_MODE.DARK)
						}>
						{isDarkTheme ? <Sun size={14} /> : <Moon size={14} />}
					</IconButton>
					<IconButton
						title='Keyboard shortcuts (?)'
						onClick={() => dispatch({ type: 'SET_SHORTCUTS_OPEN', open: true })}>
						<Keyboard size={14} />
					</IconButton>
				</div>

				<div className='h-6 w-px bg-zinc-200 dark:bg-zinc-800' />

				<PurpleOutlineButton
					onClick={() => dispatch({ type: 'SET_TEMPLATE_LIBRARY', open: true })}>
					<Library size={14} className='text-violet-600 dark:text-violet-400' />
					<span>Templates</span>
				</PurpleOutlineButton>
				<PurpleOutlineButton>
					<Share size={14} className='text-violet-600 dark:text-violet-400' />
					<span>Share</span>
				</PurpleOutlineButton>

				<div className='flex items-center shadow-xs'>
					<button
						type='button'
						onClick={handleSave}
						disabled={saveVersion.isPending}
						className='flex h-9 items-center gap-1.5 rounded-l-lg border border-r-0 border-zinc-200 bg-white px-3 text-xs font-semibold text-violet-600 shadow-xs transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800/40 dark:bg-zinc-900 dark:text-violet-400'>
						<Save size={14} className='text-violet-600 dark:text-violet-400' />
						<span>{saveVersion.isPending ? 'Saving' : 'Save'}</span>
					</button>
					<button
						type='button'
						className='flex h-9 items-center justify-center rounded-r-lg border border-zinc-200 bg-white px-2 text-violet-600 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-800/40 dark:bg-zinc-900 dark:text-violet-400'>
						<ChevronDown size={14} />
					</button>
				</div>

				<motion.button
					whileTap={!(state.nodes.length === 0 && state.ui.emptyCanvasView !== 'chat-started') ? { scale: 0.98 } : undefined}
					type='button'
					onClick={isRunning ? stopRun : runWorkflow}
					disabled={state.nodes.length === 0 && state.ui.emptyCanvasView !== 'chat-started'}
					className={[
						'flex h-9 items-center gap-2 rounded-lg px-5 text-xs font-bold text-white shadow-md transition duration-200',
						state.nodes.length === 0 && state.ui.emptyCanvasView !== 'chat-started'
							? 'opacity-40 cursor-not-allowed'
							: 'cursor-pointer',
						isRunning
							? 'bg-rose-500 shadow-rose-950/20 hover:bg-rose-400'
							: 'dark:bg-violet-750 dark:hover:bg-violet-650 bg-violet-600 shadow-violet-600/10 hover:bg-violet-500',
					].join(' ')}>
					{isRunning ? (
						<Square size={12} fill='currentColor' />
					) : (
						<Play size={12} fill='currentColor' />
					)}
					<span>Run</span>
				</motion.button>
			</div>
		</header>
	);
};

export default Topbar;
