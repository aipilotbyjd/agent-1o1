import { useState, useRef, useEffect, useMemo } from 'react';
import { useWorkflowEditor } from '../../_context/WorkflowEditorProvider.context';
import { useAiChatStore } from '@/store/aiChat.store';
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
	Check,
	GitBranch,
	Loader2,
	CheckCircle2,
	XCircle,
} from 'lucide-react';
import { builderDraftToCanvas } from '../../_helper/builderDraft.helper';

/** Matches an in-progress `@mention` fragment at the end of typed text. */
const MENTION_RE = /@([\w .-]*)$/;

/** Friendly present-tense label for a live tool-call progress line. */
const TOOL_LABELS: Record<string, string> = {
	add_node: 'Adding a node',
	remove_node: 'Removing a node',
	update_node: 'Updating a node',
	connect_nodes: 'Connecting nodes',
	disconnect_nodes: 'Disconnecting nodes',
	list_available_nodes: 'Looking up available nodes',
	inspect_node_schema: 'Checking node requirements',
	read_draft_workflow: 'Reading the current draft',
};

const formatToolLabel = (toolName: string) =>
	TOOL_LABELS[toolName] ??
	toolName.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

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
	const streamingText = useAiChatStore((store) => store.streamingText);
	const toolActivity = useAiChatStore((store) => store.toolActivity);
	const sessions = useAiChatStore((store) => store.sessions);
	const activeSessionId = useAiChatStore((store) => store.activeSessionId);
	const sendMessage = useAiChatStore((store) => store.sendMessage);
	const exitChat = useAiChatStore((store) => store.exitChat);
	const newChat = useAiChatStore((store) => store.newChat);
	const loadSession = useAiChatStore((store) => store.loadSession);
	const deleteSession = useAiChatStore((store) => store.deleteSession);
	const pendingDraft = useAiChatStore((store) => store.pendingDraft);
	const pendingDraftMessageId = useAiChatStore((store) => store.pendingDraftMessageId);
	const clearPendingDraft = useAiChatStore((store) => store.clearPendingDraft);

	const [promptInput, setPromptInput] = useState('');
	const [mode, setMode] = useState<'build' | 'ask'>('build');
	const [showHistory, setShowHistory] = useState(false);
	const [mentionQuery, setMentionQuery] = useState<string | null>(null);
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

	// Scroll to bottom when messages change (or the live reply grows)
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isThinking, streamingText, toolActivity]);

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
		if (!clean) return;
		setPromptInput('');
		setMentionQuery(null);
		sendMessage(clean, mode);
	};

	const handleRetry = (retryPrompt: string, retryMode?: 'build' | 'ask') => {
		sendMessage(retryPrompt, retryMode ?? 'build');
	};

	const handleApplyDraft = () => {
		if (!pendingDraft) return;
		const { nodes, edges } = builderDraftToCanvas(pendingDraft);
		dispatch({ type: 'APPLY_BUILDER_DRAFT', nodes, edges });
		clearPendingDraft();
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
									{/* If assistant, display thought block if applicable */}
									{!isUser && message.isThought && (
										<div className='mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-1.5'>
											<Sparkles size={11} className="text-primary-500" />
											<span className='italic'>Thought for a couple of seconds</span>
										</div>
									)}
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

							{/* Draft review — appears under the message that produced it */}
							{!isUser && pendingDraft && pendingDraftMessageId === message.id && (
								<DraftReviewCard
									draft={pendingDraft}
									currentNodeIds={state.nodes.map((n) => n.id)}
									onApply={handleApplyDraft}
									onDiscard={clearPendingDraft}
								/>
							)}
						</div>
					);
				})}

				{isThinking && (
					<div className='space-y-1'>
						<div className='flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium'>
							<div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400 animate-pulse'>
								<Sparkles size={11} />
							</div>
							<span className='font-bold text-zinc-700 dark:text-zinc-300'>Workflow Builder</span>
						</div>
						<div className='flex justify-start'>
							<div className='max-w-[85%] rounded-2xl rounded-tl-xs border border-zinc-150 bg-white px-4 py-2.5 text-[13px] text-zinc-800 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'>
								{/* Live tool-call progress — what the agent is actually doing */}
								{toolActivity.length > 0 && (
									<div className='mb-2 flex flex-col gap-1 border-b border-zinc-100 pb-2 dark:border-zinc-800'>
										{toolActivity.map((activity) => (
											<div
												key={activity.id}
												className='flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400'>
												{activity.status === 'running' && (
													<Loader2 size={11} className='animate-spin text-primary-500' />
												)}
												{activity.status === 'done' && (
													<CheckCircle2 size={11} className='text-emerald-500' />
												)}
												{activity.status === 'error' && (
													<XCircle size={11} className='text-rose-500' />
												)}
												<span>{formatToolLabel(activity.toolName)}</span>
											</div>
										))}
									</div>
								)}

								{streamingText ? (
									<div className='whitespace-pre-line'>{streamingText}</div>
								) : (
									<span className='inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400'>
										<span className='h-1.5 w-1.5 rounded-full bg-primary-400 animate-ping' />
										Thinking...
									</span>
								)}
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Container */}
			<div className='shrink-0 border-t border-zinc-150 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
				<div className='relative rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900'>
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
						placeholder='Describe what you want to automate today... (@ to reference a node)'
						className='w-full min-h-[50px] max-h-[120px] resize-none border-none bg-transparent p-0 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:ring-0 focus:outline-none dark:text-zinc-200'
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
									className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
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
									className={`rounded-md px-2.5 py-1 transition ${
										mode === 'ask'
											? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
											: 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500'
									}`}
								>
									<span>Ask</span>
								</button>
							</div>

							{/* Send Button */}
							<button
								type='button'
								onClick={handleSend}
								disabled={!promptInput.trim() || isThinking}
								className='flex h-7 w-7 items-center justify-center rounded-full bg-primary-400 text-primary-950 transition hover:bg-primary-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
							>
								<ArrowUp size={14} strokeWidth={2.5} />
							</button>
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

/** Summarizes what a generated draft would change, with Apply / Discard. */
const DraftReviewCard = ({
	draft,
	currentNodeIds,
	onApply,
	onDiscard,
}: {
	draft: { nodes: { id: string }[]; edges: unknown[] };
	currentNodeIds: string[];
	onApply: () => void;
	onDiscard: () => void;
}) => {
	const existing = new Set(currentNodeIds);
	const addedCount = draft.nodes.filter((node) => !existing.has(node.id)).length;
	const updatedCount = draft.nodes.length - addedCount;

	return (
		<div className='flex justify-start'>
			<div className='max-w-[85%] rounded-2xl border border-primary-200 bg-primary-50/60 p-3 text-[12px] dark:border-primary-900/40 dark:bg-primary-950/20'>
				<div className='mb-2 flex items-center gap-1.5 font-bold text-primary-700 dark:text-primary-300'>
					<GitBranch size={13} />
					Ready to apply
				</div>
				<div className='mb-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300'>
					{addedCount > 0 && (
						<span className='rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'>
							+{addedCount} node{addedCount === 1 ? '' : 's'}
						</span>
					)}
					{updatedCount > 0 && (
						<span className='rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'>
							{updatedCount} updated
						</span>
					)}
					{draft.edges.length > 0 && (
						<span className='rounded-full bg-zinc-200/70 px-2 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'>
							{draft.edges.length} connection{draft.edges.length === 1 ? '' : 's'}
						</span>
					)}
				</div>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						onClick={onApply}
						className='flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:bg-primary-600'>
						<Check size={12} />
						Apply to canvas
					</button>
					<button
						type='button'
						onClick={onDiscard}
						className='rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-bold text-zinc-600 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'>
						Discard
					</button>
				</div>
			</div>
		</div>
	);
};

export default AiBuilderPanel;
