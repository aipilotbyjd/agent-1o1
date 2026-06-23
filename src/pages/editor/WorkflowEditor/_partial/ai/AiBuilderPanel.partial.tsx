import { useState, useRef, useEffect } from 'react';
import { useWorkflowEditor } from '../../_context/WorkflowEditorProvider.context';
import { useAiChatStore } from '@/store/aiChat.store';
import { useAuth } from '@/context/authContext';
import Icon from '@/components/icon/Icon';
import { Paperclip, Sparkles, ArrowUp } from 'lucide-react';

const AiBuilderPanel = () => {
	const { state, dispatch } = useWorkflowEditor();
	const { userData } = useAuth();
	
	const messages = useAiChatStore((store) => store.messages);
	const isThinking = useAiChatStore((store) => store.isThinking);
	const sendMessage = useAiChatStore((store) => store.sendMessage);
	const resetChat = useAiChatStore((store) => store.resetChat);
	const exitChat = useAiChatStore((store) => store.exitChat);

	const [promptInput, setPromptInput] = useState('');
	const [mode, setMode] = useState<'build' | 'ask'>('build');
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isThinking]);

	if (!state.ui.aiPanelOpen) return null;

	const handleSend = () => {
		const clean = promptInput.trim();
		if (!clean) return;
		setPromptInput('');
		sendMessage(clean);
	};

	const handleExit = () => {
		exitChat();
		dispatch({ type: 'TOGGLE_AI_PANEL' });
		dispatch({ type: 'SET_EMPTY_CANVAS_VIEW', view: 'ai' });
	};

	const handleRestart = () => {
		resetChat();
	};

	// Fallback user avatar image
	const userAvatar = userData?.image?.org || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

	return (
		<aside className='flex h-full w-full flex-col border-r border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 select-none'>
			{/* Header */}
			<div className='shrink-0 border-b border-zinc-150 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950'>
				<div className='flex items-center justify-between gap-2'>
					<div className='flex items-center gap-2.5'>
						<div className='flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white'>
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
							onClick={handleRestart}
							className='flex h-7 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 text-[11px] font-bold text-zinc-600 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
						>
							<svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
								<path strokeLinecap='round' strokeLinejoin='round' d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' />
							</svg>
							<span>Restart Chat</span>
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
										<div className='flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400'>
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
										? 'bg-violet-50 text-violet-900 rounded-tr-xs border border-violet-100 dark:bg-violet-950/30 dark:text-violet-200 dark:border-violet-900/40'
										: 'bg-white text-zinc-800 rounded-tl-xs border border-zinc-150 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800'
								}`}>
									{/* If assistant, display thought block if applicable */}
									{!isUser && message.isThought && (
										<div className='mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-1.5'>
											<Sparkles size={11} className="text-violet-500" />
											<span className='italic'>Thought for a couple of seconds</span>
										</div>
									)}
									<div className='whitespace-pre-line'>{message.text}</div>
								</div>
							</div>
						</div>
					);
				})}
				
				{isThinking && (
					<div className='space-y-1'>
						<div className='flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium'>
							<div className='flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400 animate-pulse'>
								<Sparkles size={11} />
							</div>
							<span className='font-bold text-zinc-700 dark:text-zinc-300'>Workflow Builder</span>
						</div>
						<div className='flex justify-start'>
							<div className='bg-white text-zinc-500 rounded-2xl rounded-tl-xs border border-zinc-150 px-4 py-2.5 text-[13px] shadow-xs dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'>
								<span className='inline-flex items-center gap-1.5'>
									<span className='h-1.5 w-1.5 rounded-full bg-violet-600 animate-ping' />
									Thinking...
								</span>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Container */}
			<div className='shrink-0 border-t border-zinc-150 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950'>
				<div className='relative rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900'>
					<textarea
						value={promptInput}
						onChange={(e) => setPromptInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleSend();
							}
						}}
						placeholder='Describe what you want to automate today...'
						className='w-full min-h-[50px] max-h-[120px] resize-none border-none bg-transparent p-0 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:ring-0 focus:outline-none dark:text-zinc-200'
					/>
					
					{/* Action Buttons inside Input Box */}
					<div className='mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800/80'>
						<div className='flex items-center gap-1'>
							<button
								type='button'
								title='Attach file'
								className='flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800'
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
									<Sparkles size={10} className={mode === 'build' ? 'text-violet-500' : ''} />
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
								className='flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
							>
								<ArrowUp size={14} strokeWidth={2.5} />
							</button>
						</div>
					</div>
				</div>

				<div className='mt-2.5 text-center'>
					<span className='text-[10px] text-zinc-400 dark:text-zinc-500 font-medium'>
						Having Trouble? <a href='#' className='underline hover:text-zinc-600 dark:hover:text-zinc-300'>Report an Issue or Bug</a>
					</span>
				</div>
			</div>
		</aside>
	);
};

export default AiBuilderPanel;
