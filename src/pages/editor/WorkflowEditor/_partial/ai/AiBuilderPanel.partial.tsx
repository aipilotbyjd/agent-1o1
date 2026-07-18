import { useState, useRef, useEffect, useMemo } from 'react';
import { useWorkflowEditor } from '../../_context/WorkflowEditorProvider.context';
import { useAiChatStore, type TAiTimelineItem } from '@/store/aiChat.store';
import { useAuth } from '@/context/authContext';
import {
	Paperclip,
	Sparkles,
	ArrowUp,
	History,
	Plus,
	Trash2,
	MessageSquare,
	X,
	RotateCcw,
	Loader2,
	CheckCircle2,
	XCircle,
	ChevronRight,
	CirclePlus,
	Pencil,
	Link2,
	Unlink,
	Search,
	Wrench,
	Square,
} from 'lucide-react';
import type { TCanvasNode } from '../../_types/canvas.type';

/** Matches an in-progress `@mention` fragment at the end of typed text. */
const MENTION_RE = /@([\w .-]*)$/;

const prettify = (raw: string) =>
	raw.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const nodeLabel = (nodes: TCanvasNode[], id: unknown): string => {
	if (typeof id !== 'string' || !id) return 'node';
	return nodes.find((n) => n.id === id)?.data.label || id;
};

/**
 * Icon + dynamic present-tense caption for a live tool call, built from that
 * call's actual arguments (not a generic per-tool label) — Gumloop-style.
 * `toolName` is the resolved Laravel\Ai tool name, which (since our tool
 * classes don't define name()) falls back to the PascalCase class basename.
 */
const describeToolCall = (
	toolName: string,
	args: Record<string, unknown>,
	nodes: TCanvasNode[],
): { Icon: typeof Search; text: string } => {
	switch (toolName) {
		case 'AddNodeTool': {
			const type = typeof args.type === 'string' ? args.type : '';
			const label = (typeof args.name === 'string' && args.name) || prettify(type || 'node');
			return { Icon: CirclePlus, text: `Add ${label} node` };
		}
		case 'RemoveNodeTool':
			return { Icon: Trash2, text: `Remove ${nodeLabel(nodes, args.node_id)} node` };
		case 'UpdateNodeTool':
			return { Icon: Pencil, text: `Update ${nodeLabel(nodes, args.node_id)} node` };
		case 'ConnectNodesTool':
			return {
				Icon: Link2,
				text: `Connect ${nodeLabel(nodes, args.source)} → ${nodeLabel(nodes, args.target)}`,
			};
		case 'DisconnectNodesTool':
			return {
				Icon: Unlink,
				text: `Disconnect ${nodeLabel(nodes, args.source)} → ${nodeLabel(nodes, args.target)}`,
			};
		case 'ListAvailableNodesTool':
			return {
				Icon: Search,
				text:
					typeof args.category === 'string' && args.category
						? `Look up ${prettify(args.category)} nodes`
						: 'Look up available nodes',
			};
		case 'InspectNodeSchemaTool':
			return {
				Icon: Search,
				text: `Check requirements for ${prettify(typeof args.node_type === 'string' ? args.node_type : 'node')}`,
			};
		case 'ReadDraftWorkflowTool':
			return { Icon: Search, text: 'Read the current draft' };
		default:
			return { Icon: Wrench, text: prettify(toolName.replace(/Tool$/, '')) };
	}
};

const formatRelativeTime = (ts: number) => {
	const diffMs = Date.now() - ts;
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return 'Just now';
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;
	const diffDay = Math.floor(diffHr / 24);
	if (diffDay < 7) return `${diffDay}d ago`;
	return new Date(ts).toLocaleDateString();
};

const AiBuilderPanel = () => {
	const { state, dispatch } = useWorkflowEditor();
	const { userData } = useAuth();

	const messages = useAiChatStore((store) => store.messages);
	const isThinking = useAiChatStore((store) => store.isThinking);
	const streamTimeline = useAiChatStore((store) => store.streamTimeline);
	const sessions = useAiChatStore((store) => store.sessions);
	const activeSessionId = useAiChatStore((store) => store.activeSessionId);
	const sendMessage = useAiChatStore((store) => store.sendMessage);
	const stopThinking = useAiChatStore((store) => store.stopThinking);
	const exitChat = useAiChatStore((store) => store.exitChat);
	const newChat = useAiChatStore((store) => store.newChat);
	const loadSession = useAiChatStore((store) => store.loadSession);
	const deleteSession = useAiChatStore((store) => store.deleteSession);

	const [promptInput, setPromptInput] = useState('');
	const [mode, setMode] = useState<'build' | 'ask'>('build');
	const [showHistory, setShowHistory] = useState(false);
	const [mentionQuery, setMentionQuery] = useState<string | null>(null);
	const [stepsExpanded, setStepsExpanded] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

	// Nodes currently on the canvas, matched against an in-progress @mention.
	const mentionMatches = useMemo(() => {
		if (mentionQuery === null) return [];
		const q = mentionQuery.toLowerCase();
		return state.nodes
			.filter((node) => (node.data.label || '').toLowerCase().includes(q))
			.slice(0, 6);
	}, [mentionQuery, state.nodes]);

	// The last timeline entry is "in progress"; everything before it is settled
	// history, shown in a collapsible section — mirrors Gumloop's builder.
	const activeItem: TAiTimelineItem | undefined = streamTimeline[streamTimeline.length - 1];
	const historyItems = streamTimeline.slice(0, -1);
	const toolCount = streamTimeline.filter((item) => item.kind === 'tool').length;

	// Typewriter for the active text segment only — earlier segments already
	// finished streaming and render in full immediately. Resets whenever the
	// active item's identity changes (new segment, or a tool call interrupts).
	const activeTextTarget = activeItem?.kind === 'text' ? activeItem.text : '';
	const [displayedActiveText, setDisplayedActiveText] = useState('');
	const displayedRef = useRef('');
	useEffect(() => {
		displayedRef.current = '';
		setDisplayedActiveText('');
	}, [activeItem?.id]);
	useEffect(() => {
		if (!isThinking || activeItem?.kind !== 'text') return;
		let raf: number;
		const tick = () => {
			if (displayedRef.current.length < activeTextTarget.length) {
				const next = activeTextTarget.slice(0, displayedRef.current.length + 2);
				displayedRef.current = next;
				setDisplayedActiveText(next);
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [isThinking, activeItem?.kind, activeTextTarget]);

	// Scroll to bottom when messages change (or the live reply grows)
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isThinking, displayedActiveText, streamTimeline.length]);

	if (!state.ui.aiPanelOpen) return null;

	const updateMentionQuery = (value: string) => {
		const match = MENTION_RE.exec(value);
		setMentionQuery(match ? match[1] : null);
	};

	const insertMention = (label: string) => {
		const withoutFragment = promptInput.replace(MENTION_RE, '');
		const next = `${withoutFragment}@${label} `;
		setPromptInput(next);
		setMentionQuery(null);
		textareaRef.current?.focus();
	};

	const handleSend = () => {
		const clean = promptInput.trim();
		if (!clean || isThinking) return;
		setPromptInput('');
		setMentionQuery(null);
		setStepsExpanded(true);
		sendMessage(clean, mode);
	};

	const handleRetry = (retryPrompt: string, retryMode?: 'build' | 'ask') => {
		sendMessage(retryPrompt, retryMode ?? 'build');
	};

	const handleExit = () => {
		exitChat();
		dispatch({ type: 'TOGGLE_AI_PANEL' });
		dispatch({ type: 'SET_EMPTY_CANVAS_VIEW', view: 'ai' });
	};

	const handleNewChat = () => {
		newChat();
		setShowHistory(false);
	};

	const handleLoadSession = (id: string) => {
		loadSession(id);
		setShowHistory(false);
	};

	// Fallback user avatar image
	const userAvatar = userData?.image?.org || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

	return (
		<aside className='relative flex h-full w-full flex-col overflow-hidden border-r border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 select-none'>
			{/* Header */}
			<div className='shrink-0 border-b border-zinc-150 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950'>
				<div className='flex items-center justify-between gap-2'>
					<div className='flex items-center gap-2.5'>
						<button
							type='button'
							onClick={() => setShowHistory(true)}
							title='Chat history'
							aria-label='Chat history'
							className='flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-xs hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
						>
							<History size={14} />
						</button>
						<div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary-400 text-primary-950'>
							<Sparkles size={18} className="fill-white" />
						</div>
						<div>
							<div className='text-sm font-bold text-zinc-800 dark:text-white'>
								Workflow Builder
							</div>
							<div className='text-[10px] text-zinc-400 dark:text-zinc-500 font-medium'>
								Your AI workflow building assistant
							</div>
						</div>
					</div>
					<div className='flex items-center gap-1.5'>
						<button
							type='button'
							onClick={handleNewChat}
							title='New chat'
							className='flex h-7 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 text-[11px] font-bold text-zinc-600 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
						>
							<Plus size={12} />
							<span>New Chat</span>
						</button>
						<button
							type='button'
							onClick={handleExit}
							className='flex h-7 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 text-[11px] font-bold text-zinc-600 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
						>
							<svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
								<path strokeLinecap='round' strokeLinejoin='round' d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75' />
							</svg>
							<span>Exit</span>
						</button>
					</div>
				</div>
			</div>

			{/* Chat Messages */}
			<div className='min-h-0 flex-1 overflow-y-auto p-4 space-y-5 bg-zinc-50/40 dark:bg-zinc-950/20'>
				{messages.map((message) => {
					const isUser = message.role === 'user';
					return (
						<div key={message.id} className='space-y-1'>
							{/* Message Header */}
							<div className={`flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium ${isUser ? 'justify-end' : ''}`}>
								{!isUser && (
									<>
										<div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400'>
											<Sparkles size={11} className="fill-current" />
										</div>
										<span className='font-bold text-zinc-700 dark:text-zinc-300'>Workflow Builder</span>
									</>
								)}
								{message.timestamp && <span>{message.timestamp}</span>}
								{isUser && (
									<>
										<img src={userAvatar} alt='User' className='h-5 w-5 rounded-full object-cover border border-zinc-200' />
									</>
								)}
							</div>

							{/* Message Body */}
							<div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
								<div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-xs ${
									isUser
										? 'bg-primary-50 text-primary-900 rounded-tr-xs border border-primary-100 dark:bg-primary-950/30 dark:text-primary-200 dark:border-primary-900/40'
										: 'bg-white text-zinc-800 rounded-tl-xs border border-zinc-150 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800'
								}`}>
									<div className='whitespace-pre-line'>{message.text}</div>

									{message.isError && message.retryPrompt && (
										<button
											type='button'
											onClick={() => handleRetry(message.retryPrompt!, message.retryMode)}
											className='mt-2 flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 shadow-xs hover:bg-rose-50 dark:border-rose-900/40 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/30'
										>
											<RotateCcw size={11} />
											<span>Retry</span>
										</button>
									)}
								</div>
							</div>
						</div>
					);
				})}

				{/* Live scratchpad — reasoning + tool calls as they stream, not a bubble */}
				{isThinking && (
					<div className='space-y-1.5'>
						<div className='flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium'>
							<div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400 animate-pulse'>
								<Sparkles size={11} />
							</div>
							<span className='font-bold text-zinc-700 dark:text-zinc-300'>Workflow Builder</span>
						</div>

						<div className='pl-7'>
							{streamTimeline.length === 0 && (
								<div className='flex items-center gap-1.5 text-[12px] text-zinc-500 dark:text-zinc-400'>
									<span className='h-1.5 w-1.5 rounded-full bg-primary-400 animate-ping' />
									Getting started…
								</div>
							)}

							{toolCount > 0 && (
								<button
									type='button'
									onClick={() => setStepsExpanded((v) => !v)}
									className='mb-1.5 flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'>
									<ChevronRight
										size={12}
										className={`transition-transform ${stepsExpanded ? 'rotate-90' : ''}`}
									/>
									{toolCount} step{toolCount === 1 ? '' : 's'}
								</button>
							)}

							{stepsExpanded && historyItems.length > 0 && (
								<div className='mb-2 flex flex-col gap-1.5'>
									{historyItems.map((item) =>
										item.kind === 'text' ? (
											<p
												key={item.id}
												className='text-[12.5px] leading-relaxed text-zinc-500 dark:text-zinc-400'>
												{item.text}
											</p>
										) : (
											<ToolLine key={item.id} item={item} nodes={state.nodes} />
										),
									)}
								</div>
							)}

							{activeItem && (
								<div className='flex items-start gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[12.5px] font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'>
									{activeItem.kind === 'tool' ? (
										<ActiveToolLine item={activeItem} nodes={state.nodes} />
									) : (
										<span className='whitespace-pre-line'>
											{displayedActiveText}
											<span className='ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-current align-middle' />
										</span>
									)}
								</div>
							)}
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Container */}
			<div className='shrink-0 border-t border-zinc-150 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
				<div
					className={`relative rounded-2xl border p-3 shadow-xs transition-colors ${
						isThinking
							? 'border-primary-300 bg-primary-50/30 ring-2 ring-primary-200/60 dark:border-primary-700 dark:bg-primary-950/10 dark:ring-primary-900/40'
							: 'border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900'
					}`}>
					{mentionQuery !== null && mentionMatches.length > 0 && (
						<ul className='absolute bottom-full left-3 z-30 mb-1.5 max-h-40 w-56 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 text-[11px] shadow-lg dark:border-zinc-700 dark:bg-zinc-900'>
							{mentionMatches.map((node) => (
								<li key={node.id}>
									<button
										type='button'
										onMouseDown={(e) => {
											e.preventDefault();
											insertMention(node.data.label || node.data.defKey);
										}}
										className='flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'>
										<span className='truncate font-medium'>{node.data.label || node.data.defKey}</span>
									</button>
								</li>
							))}
						</ul>
					)}
					<textarea
						ref={textareaRef}
						value={promptInput}
						disabled={isThinking}
						onChange={(e) => {
							setPromptInput(e.target.value);
							updateMentionQuery(e.target.value);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey && mentionQuery === null) {
								e.preventDefault();
								handleSend();
							}
							if (e.key === 'Escape') setMentionQuery(null);
						}}
						placeholder={isThinking ? 'Responding…' : 'Describe what you want to automate today... (@ to reference a node)'}
						className='w-full min-h-[50px] max-h-[120px] resize-none border-none bg-transparent p-0 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:ring-0 focus:outline-none disabled:cursor-not-allowed dark:text-zinc-200'
					/>

					{/* Action Buttons inside Input Box */}
					<div className='mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800/80'>
						<div className='flex items-center gap-1'>
							<button
								type='button'
								disabled
								title='Attachments are coming soon'
								className='flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-lg text-zinc-300 dark:text-zinc-600'
							>
								<Paperclip size={14} />
							</button>
						</div>

						<div className='flex items-center gap-2'>
							{/* Build / Ask Toggle */}
							<div className='flex items-center rounded-lg bg-zinc-100 p-0.5 text-[11px] font-bold dark:bg-zinc-800'>
								<button
									type='button'
									onClick={() => setMode('build')}
									disabled={isThinking}
									className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition disabled:cursor-not-allowed ${
										mode === 'build'
											? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
											: 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500'
									}`}
								>
									<Sparkles size={10} className={mode === 'build' ? 'text-primary-500' : ''} />
									<span>Build</span>
								</button>
								<button
									type='button'
									onClick={() => setMode('ask')}
									disabled={isThinking}
									className={`rounded-md px-2.5 py-1 transition disabled:cursor-not-allowed ${
										mode === 'ask'
											? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
											: 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500'
									}`}
								>
									<span>Ask</span>
								</button>
							</div>

							{/* Send / Stop Button */}
							{isThinking ? (
								<button
									type='button'
									onClick={stopThinking}
									title='Stop'
									className='flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white transition hover:bg-rose-600 active:scale-95'
								>
									<Square size={11} fill='currentColor' />
								</button>
							) : (
								<button
									type='button'
									onClick={handleSend}
									disabled={!promptInput.trim()}
									className='flex h-7 w-7 items-center justify-center rounded-full bg-primary-400 text-primary-950 transition hover:bg-primary-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
								>
									<ArrowUp size={14} strokeWidth={2.5} />
								</button>
							)}
						</div>
					</div>
				</div>

				<div className='mt-2.5 text-center'>
					<span className='text-[10px] text-zinc-400 dark:text-zinc-500 font-medium'>
						Having Trouble?{' '}
					<a
						href='mailto:support@agent1o1.com?subject=Workflow%20Builder%20issue'
						className='underline hover:text-zinc-600 dark:hover:text-zinc-300'>
						Report an Issue or Bug
					</a>
					</span>
				</div>
			</div>

			{/* Chat History Sidebar (slide-in overlay) */}
			<div
				className={`absolute inset-0 z-20 bg-black/20 backdrop-blur-[1px] transition-opacity dark:bg-black/40 ${
					showHistory ? 'opacity-100' : 'pointer-events-none opacity-0'
				}`}
				onClick={() => setShowHistory(false)}
			/>
			<div
				className={`absolute inset-y-0 left-0 z-30 flex w-[85%] max-w-[280px] flex-col border-r border-zinc-200 bg-white shadow-2xl transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-950 ${
					showHistory ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className='flex shrink-0 items-center justify-between border-b border-zinc-150 px-3.5 py-3 dark:border-zinc-800'>
					<div className='flex items-center gap-1.5 text-sm font-bold text-zinc-800 dark:text-white'>
						<History size={14} className='text-zinc-400 dark:text-zinc-500' />
						Chat History
					</div>
					<button
						type='button'
						onClick={() => setShowHistory(false)}
						title='Close'
						className='flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
					>
						<X size={14} />
					</button>
				</div>

				<div className='shrink-0 p-2.5'>
					<button
						type='button'
						onClick={handleNewChat}
						className='flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-400 px-3 py-2 text-xs font-bold text-primary-950 shadow-xs transition hover:bg-primary-500'
					>
						<Plus size={13} />
						<span>New Chat</span>
					</button>
				</div>

				<div className='min-h-0 flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-1'>
					{sortedSessions.length === 0 ? (
						<div className='flex h-full flex-col items-center justify-center gap-2 px-6 text-center'>
							<div className='flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600'>
								<MessageSquare size={18} />
							</div>
							<div className='text-xs font-semibold text-zinc-500 dark:text-zinc-400'>
								No previous chats yet
							</div>
							<div className='text-[11px] text-zinc-400 dark:text-zinc-600'>
								Conversations you start will show up here.
							</div>
						</div>
					) : (
						sortedSessions.map((session) => (
							<div
								key={session.id}
								role='button'
								tabIndex={0}
								onClick={() => handleLoadSession(session.id)}
								onKeyDown={(e) => e.key === 'Enter' && handleLoadSession(session.id)}
								className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition ${
									session.id === activeSessionId
										? 'bg-primary-50 dark:bg-primary-950/30'
										: 'hover:bg-zinc-50 dark:hover:bg-zinc-900/70'
								}`}>
								<MessageSquare
									size={14}
									className={
										session.id === activeSessionId
											? 'text-primary-600 dark:text-primary-400 shrink-0'
											: 'text-zinc-400 dark:text-zinc-600 shrink-0'
									}
								/>
								<div className='min-w-0 flex-1'>
									<div className='truncate text-xs font-semibold text-zinc-700 dark:text-zinc-200'>
										{session.title}
									</div>
									<div className='text-[10px] text-zinc-400 dark:text-zinc-500'>
										{formatRelativeTime(session.updatedAt)}
									</div>
								</div>
								<button
									type='button'
									title='Delete chat'
									onClick={(e) => {
										e.stopPropagation();
										deleteSession(session.id);
									}}
									className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:text-zinc-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400'>
									<Trash2 size={12} />
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</aside>
	);
};

/** One completed tool-call line in the collapsed step history. */
const ToolLine = ({
	item,
	nodes,
}: {
	item: Extract<TAiTimelineItem, { kind: 'tool' }>;
	nodes: TCanvasNode[];
}) => {
	const { Icon, text } = describeToolCall(item.toolName, item.arguments, nodes);
	return (
		<div className='flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400'>
			{item.status === 'running' && <Loader2 size={11} className='shrink-0 animate-spin text-primary-500' />}
			{item.status === 'done' && <CheckCircle2 size={11} className='shrink-0 text-emerald-500' />}
			{item.status === 'error' && <XCircle size={11} className='shrink-0 text-rose-500' />}
			<Icon size={11} className='shrink-0 opacity-60' />
			<span>{text}</span>
		</div>
	);
};

/** The currently in-flight tool call, shown prominently and boxed. */
const ActiveToolLine = ({
	item,
	nodes,
}: {
	item: Extract<TAiTimelineItem, { kind: 'tool' }>;
	nodes: TCanvasNode[];
}) => {
	const { Icon, text } = describeToolCall(item.toolName, item.arguments, nodes);
	return (
		<>
			{item.status === 'running' && <Loader2 size={13} className='mt-0.5 shrink-0 animate-spin text-primary-500' />}
			{item.status === 'done' && <CheckCircle2 size={13} className='mt-0.5 shrink-0 text-emerald-500' />}
			{item.status === 'error' && <XCircle size={13} className='mt-0.5 shrink-0 text-rose-500' />}
			<span className='flex items-center gap-1.5'>
				<Icon size={12} className='shrink-0 opacity-60' />
				{text}
			</span>
		</>
	);
};

export default AiBuilderPanel;
