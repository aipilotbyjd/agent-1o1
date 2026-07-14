import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	ArrowUp,
	Bot,
	Paperclip,
	Share2,
	Sparkles,
	SquarePen,
	Link2,
	Play,
	CheckCircle2,
	Plus,
	Moon,
	Sun,
	Send,
	Database,
	Users,
	Download,
	SlidersHorizontal,
	MoreHorizontal,
	Ghost,
	Mic,
	X,
	CheckSquare,
	Square,
	ChevronDown,
	ChevronRight,
	FileText,
	Globe,
	Zap,
	Cpu,
	Undo2,
	Flame,
	Layers,
	MessageSquare,
	Brain,
	Target,
	BarChart2,
	Shield,
	Copy,
	Lock,
	AlertTriangle,
	ExternalLink,
	Mail,
	FileSpreadsheet,
	HardDrive,
	Calendar,
	TrendingUp,
	Search,
	Rocket,
	Loader2,
	RotateCcw,
	FileJson,
	Trash2,
} from 'lucide-react';
import AgentTemplateCard from '../_partial/AgentTemplateCard.partial';
import { agentTemplateTabs, agentTemplates } from '../_helper/agentBuilder.constants';
import MainAppBar, { MainAppBarPillButton, MainAppBarIconButton } from '@/pages/app/_partial/MainAppBar.partial';
import { toast } from 'react-toastify';
import useDarkMode from '@/hooks/useDarkMode';
import DARK_MODE from '@/constants/darkMode.constant';
import mockChatData from '@/mocks/agentChatData.json';

interface TMessage {
	id: string;
	sender: 'agent' | 'user';
	text: string;
	timestamp: string;
	type?: 'text' | 'table';
	headers?: string[];
	data?: any[];
	followUp?: string;
	actions?: { label: string; type: string }[];
}

const BuildPage = () => {
	const [activeTab, setActiveTab] = useState('All');
	const [promptText, setPromptText] = useState('');
	const { isDarkTheme, setDarkModeStatus } = useDarkMode();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const chatEndRef = useRef<HTMLDivElement>(null);

	// Preview / Chat states
	const [isPreviewMode, setIsPreviewMode] = useState(false);
	const [agentName, setAgentName] = useState('Lead Generation Agent');
	const [agentIcon, setAgentIcon] = useState<any>(Bot);
	const [agentIconColor, setAgentIconColor] = useState('purple');
	const [chatHistory, setChatHistory] = useState<TMessage[]>([]);
	const [chatInput, setChatInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [incognito, setIncognito] = useState(false);
	const [skillEnabled, setSkillEnabled] = useState(true);

	// Sidebar settings panel states
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [activeSidebarTab, setActiveSidebarTab] = useState<'agent' | 'settings' | 'chatDetails'>('agent');
	const [agentInstructions, setAgentInstructions] = useState('');
	const [allowSelfUpdates, setAllowSelfUpdates] = useState(true);
	const [agentDescription, setAgentDescription] = useState(
		'An agent that helps me research competitors, analyze their strategies, products, pricing, marketing, reviews, and overall market positioning.'
	);

	// Icon Picker Dropdown State
	const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

	// Connected Apps State
	const [connectedApps, setConnectedApps] = useState([
		{ id: 'firecrawl', name: 'Firecrawl', desc: 'Scrape and extract data from websites.', icon: Flame, iconBg: 'bg-orange-500', isConnected: true },
		{ id: 'google-docs', name: 'Google Docs', desc: 'Create, read and update documents.', icon: FileText, iconBg: 'bg-blue-500', isConnected: false },
		{ id: 'parallel', name: 'Parallel', desc: 'Run AI tasks in parallel for faster results.', icon: Globe, iconBg: 'bg-zinc-800 dark:bg-zinc-700 border dark:border-zinc-650', isConnected: true }
	]);

	// Add an App drawer states
	const [isAddAppOpen, setIsAddAppOpen] = useState(false);
	const [appSearchQuery, setAppSearchQuery] = useState('');
	const [appCategory, setAppCategory] = useState<'all' | 'custom'>('all');

	// Saving and dropdown states
	const [isSaving, setIsSaving] = useState(false);
	const [saveStatus, setSaveStatus] = useState('Agent draft autosaved');
	const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

	const toggleDarkMode = () => {
		setDarkModeStatus(isDarkTheme ? DARK_MODE.LIGHT : DARK_MODE.DARK);
	};

	// Auto-scroll chat to bottom
	useEffect(() => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [chatHistory, isTyping]);

	const suggestionChips = [
		{
			label: 'Recruiting Sourcer',
			text: 'Create a recruiting agent that reads a job description and finds matching candidates, scores them, and drafts outreach.',
			icon: Users,
		},
		{
			label: 'Feedback Analyzer',
			text: 'Build an agent that reads support tickets, groups them by theme, and produces a summary report.',
			icon: Sparkles,
		},
		{
			label: 'Database SQL Analyst',
			text: 'Create a SQL analyst agent that connects to a database, runs query metrics, and alerts on anomalies.',
			icon: Database,
		},
	];

	const selectableIcons = [
		{ Icon: Bot },
		{ Icon: Flame },
		{ Icon: Search },
		{ Icon: Target },
		{ Icon: SlidersHorizontal },
		{ Icon: Shield },
		{ Icon: Sparkles },
		{ Icon: Brain },
		{ Icon: Rocket },
		{ Icon: Layers },
	];

	const colorsList = [
		{ value: 'purple', bgClass: 'bg-violet-600' },
		{ value: 'blue', bgClass: 'bg-blue-500' },
		{ value: 'teal', bgClass: 'bg-teal-500' },
		{ value: 'orange', bgClass: 'bg-amber-500' },
		{ value: 'red', bgClass: 'bg-rose-500' },
		{ value: 'rainbow', bgClass: 'bg-gradient-to-tr from-violet-500 via-emerald-500 to-rose-500' },
	];

	const availableApps = [
		{ id: 'slack', name: 'Slack', desc: 'Connect Slack channels and send notifications.', icon: MessageSquare, iconBg: 'bg-rose-500', isConnected: true },
		{ id: 'airtable', name: 'Airtable', desc: 'Read and write data to Airtable bases.', icon: Database, iconBg: 'bg-blue-400', isConnected: true },
		{ id: 'gmail', name: 'Gmail', desc: 'Send and read emails directly.', icon: Mail, iconBg: 'bg-red-500', isConnected: true },
		{ id: 'google-sheets', name: 'Google Sheets', desc: 'Create and update spreadsheet rows.', icon: FileSpreadsheet, iconBg: 'bg-emerald-500', isConnected: true },
		{ id: 'google-drive', name: 'Google Drive', desc: 'Search and read files from Google Drive.', icon: HardDrive, iconBg: 'bg-blue-600', isConnected: true },
		{ id: 'google-calendar', name: 'Google Calendar', desc: 'Create calendar events.', icon: Calendar, iconBg: 'bg-blue-500', isConnected: true },
		{ id: 'google-docs', name: 'Google Docs', desc: 'Create, read and update documents.', icon: FileText, iconBg: 'bg-blue-500', isConnected: true },
		{ id: 'google-slides', name: 'Google Slides', desc: 'Generate presentation slides.', icon: FileText, iconBg: 'bg-amber-500', isConnected: true },
		{ id: 'google-ads', name: 'Google Ads', desc: 'Create search keyword campaigns.', icon: TrendingUp, iconBg: 'bg-blue-500', isConnected: true },
		{ id: 'google-search-console', name: 'Google Search Console', desc: 'Check search engine optimization details.', icon: Search, iconBg: 'bg-blue-500', isConnected: true },
		{ id: 'google-bigquery', name: 'Google BigQuery', desc: 'Run SQL analytics on datasets.', icon: Database, iconBg: 'bg-indigo-500', isConnected: true },
	];

	const getIconColorClass = (color: string) => {
		switch (color) {
			case 'green':
				return 'text-emerald-500 dark:text-emerald-400';
			case 'blue':
				return 'text-blue-500 dark:text-blue-400';
			case 'teal':
				return 'text-teal-500 dark:text-teal-400';
			case 'orange':
				return 'text-amber-500 dark:text-amber-400';
			case 'red':
				return 'text-rose-500 dark:text-rose-400';
			case 'rainbow':
				return 'text-transparent bg-clip-text bg-gradient-to-tr from-violet-500 via-emerald-500 to-rose-500';
			default: // purple
				return 'text-violet-500 dark:text-violet-400';
		}
	};

	const handleChipClick = (text: string) => {
		setPromptText(text);
		if (textareaRef.current) {
			textareaRef.current.focus();
		}
	};

	// Start preview mode with selected agent details
	const startPreview = (name: string, icon: any, color: string, customGreeting?: string) => {
		setAgentName(name);
		setAgentIcon(icon);
		setAgentIconColor(color);
		setIsPreviewMode(true);

		const greeting = customGreeting || `Hi! I'm your ${name}. How can I help you today?`;
		setChatHistory([
			{
				id: 'init-' + Date.now(),
				sender: 'agent',
				text: greeting,
				timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				type: 'text',
			},
		]);
	};

	// Handle Generate agent click from main builder prompt
	const handleSendMessage = () => {
		if (!promptText.trim()) {
			startPreview('Lead Generation Agent', Bot, 'purple');
			toast.info('Starting default Lead Generation Agent preview.');
			return;
		}

		let matchedName = 'Lead Generation Agent';
		let matchedIcon = Bot;
		let matchedColor = 'purple';
		let greeting = `Hi! I'm your Lead Generation Agent. How can I help you today?`;

		const promptLower = promptText.toLowerCase();
		if (promptLower.includes('recruit') || promptLower.includes('job') || promptLower.includes('candidate')) {
			matchedName = 'Recruiting Sourcer Agent';
			matchedIcon = Users;
			matchedColor = 'purple';
			greeting = `Hi! I'm your Recruiting Sourcer Agent. How can I help you today?`;
		} else if (promptLower.includes('feedback') || promptLower.includes('ticket') || promptLower.includes('support')) {
			matchedName = 'Feedback Digest Agent';
			matchedIcon = Bot;
			matchedColor = 'green';
			greeting = `Hi! I'm your Feedback Digest Agent. How can I help you today?`;
		} else if (promptLower.includes('sql') || promptLower.includes('database') || promptLower.includes('query')) {
			matchedName = 'Database SQL Analyst Agent';
			matchedIcon = Database;
			matchedColor = 'purple';
			greeting = `Hi! I'm your Database SQL Analyst Agent. How can I help you today?`;
		}

		startPreview(matchedName, matchedIcon, matchedColor, greeting);

		const userMsg = promptText;
		setPromptText('');

		setTimeout(() => {
			sendChatMessage(userMsg);
		}, 800);
	};

	// Handle template card clicks
	const handleTemplateClick = (templateTitle: string) => {
		let matchedName = 'Lead Generation Agent';
		let matchedIcon = Bot;
		let matchedColor = 'purple';

		if (templateTitle === 'Recruiting Sourcer') {
			matchedName = 'Recruiting Sourcer Agent';
			matchedIcon = Users;
			matchedColor = 'purple';
		} else if (templateTitle === 'Feedback Digest Agent') {
			matchedName = 'Feedback Digest Agent';
			matchedIcon = Bot;
			matchedColor = 'green';
		} else if (templateTitle === 'Weekly Recap Agent') {
			matchedName = 'Weekly Recap Agent';
			matchedIcon = Users;
			matchedColor = 'purple';
		} else if (templateTitle === 'LinkedIn Outreach Expert') {
			matchedName = 'LinkedIn Outreach Expert Agent';
			matchedIcon = Users;
			matchedColor = 'purple';
		} else if (templateTitle === 'Metrics Analyst Bot') {
			matchedName = 'Metrics Analyst Bot';
			matchedIcon = Database;
			matchedColor = 'purple';
		} else if (templateTitle === 'SEO Content Planner') {
			matchedName = 'SEO Content Planner Agent';
			matchedIcon = Bot;
			matchedColor = 'purple';
		}

		const greeting = `Hi! I'm your ${matchedName}. How can I help you today?`;
		startPreview(matchedName, matchedIcon, matchedColor, greeting);
	};

	// Process message and find match from JSON
	const sendChatMessage = (messageText: string) => {
		if (!messageText.trim()) return;

		const userMsg: TMessage = {
			id: 'user-' + Date.now(),
			sender: 'user',
			text: messageText,
			timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		};

		setChatHistory((prev) => [...prev, userMsg]);
		setIsTyping(true);

		const query = messageText.toLowerCase();
		let matched = mockChatData.find((item: any) => {
			if (item.keywords.includes('default')) return false;
			return item.keywords.some((kw: string) => query.includes(kw));
		});

		if (!matched) {
			matched = mockChatData.find((item: any) => item.keywords.includes('default'));
		}

		setTimeout(() => {
			if (matched) {
				const agentMsg: TMessage = {
					id: 'agent-' + Date.now(),
					sender: 'agent',
					text: matched.response,
					timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					type: matched.type as any,
					headers: matched.headers,
					data: matched.data,
					followUp: matched.followUp,
					actions: matched.actions,
				};
				setChatHistory((prev) => [...prev, agentMsg]);
			}
			setIsTyping(false);
		}, 1200);
	};

	// Action chip clicks in chat response
	const handleActionClick = (action: { label: string; type: string }) => {
		if (action.type === 'export_csv') {
			toast.success('List exported as CSV successfully!');
			return;
		}
		if (action.type === 'pdf_digest') {
			toast.success('PDF digest report generated!');
			return;
		}
		if (action.type === 'email_summary') {
			toast.success('Summary emailed to the product team!');
			return;
		}

		// Otherwise, send it as a user chat message
		sendChatMessage(action.label);
	};

	// Add selected app to active connected apps
	const handleAddAppFromList = (app: typeof availableApps[0]) => {
		if (connectedApps.some((a) => a.id === app.id)) {
			toast.info(`${app.name} is already added!`);
			return;
		}

		const newApp = {
			id: app.id,
			name: app.name,
			desc: app.desc,
			icon: app.icon,
			iconBg: app.iconBg,
			isConnected: true,
		};

		setConnectedApps((prev) => [...prev, newApp]);
		toast.success(`${app.name} connected successfully!`);
		setIsAddAppOpen(false);
	};

	// Filter templates based on dynamic active tab state, limited to first 3
	const filteredTemplates = (
		activeTab === 'All'
			? agentTemplates
			: agentTemplates.filter((template) => template.categories?.includes(activeTab))
	).slice(0, 3);

	// Filter available apps based on search query
	const filteredAvailableApps = availableApps.filter((app) => {
		const matchesSearch = app.name.toLowerCase().includes(appSearchQuery.toLowerCase()) || 
		                      app.desc.toLowerCase().includes(appSearchQuery.toLowerCase());
		if (appCategory === 'custom') {
			return matchesSearch && app.id === 'slack'; // mock custom category
		}
		return matchesSearch;
	});

	const AgentIconComponent = agentIcon;

	return (
		<div className='dark:text-zinc-550 relative flex min-w-0 flex-1 flex-col overflow-hidden bg-zinc-50/50 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950'>
			{/* Ambient Lighting Gradients */}
			<div className='pointer-events-none absolute top-[-100px] left-1/4 -z-10 h-[380px] w-[380px] rounded-full bg-violet-500/8 blur-[120px] dark:bg-violet-600/12' />
			<div className='pointer-events-none absolute right-1/4 bottom-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-emerald-500/8 blur-[140px] dark:bg-emerald-600/12' />

			{!isPreviewMode ? (
				<>
					{/* Main Header / Top Bar */}
					<MainAppBar
						title='Agent Builder'
						status={saveStatus}
						meta='Templates ready'
						primaryActionLabel='Create agent'
						primaryActionIcon={Plus}
						primaryActionColor='purple'
						showWorkspaceActions={false}
						showThemeToggle={false}
						onPrimaryAction={handleSendMessage}>
						{/* Share button */}
						<MainAppBarPillButton onClick={() => {
							navigator.clipboard.writeText(window.location.href);
							toast.success('Share link copied to clipboard!');
						}}>
							<Share2 size={15} />
							Share
						</MainAppBarPillButton>
						{/* Theme Toggle button (Moon/Sun) */}
						<MainAppBarIconButton title='Toggle theme' onClick={toggleDarkMode} className='border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.03]'>
							{isDarkTheme ? <Sun size={15} /> : <Moon size={15} />}
						</MainAppBarIconButton>
						{/* Save button with loading feedback */}
						<MainAppBarPillButton 
							onClick={() => {
								if (isSaving) return;
								setIsSaving(true);
								setSaveStatus('Saving changes...');
								setTimeout(() => {
									setIsSaving(false);
									const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
									setSaveStatus(`Saved at ${now}`);
									toast.success('Agent draft saved successfully!');
								}, 1000);
							}}>
							{isSaving ? (
								<Loader2 size={15} className='animate-spin text-violet-600 dark:text-violet-400' />
							) : (
								<CheckCircle2 size={15} />
							)}
							<span>{isSaving ? 'Saving...' : 'Save'}</span>
						</MainAppBarPillButton>
						{/* Preview button with live state values */}
						<MainAppBarPillButton
							onClick={() => startPreview(agentName, agentIcon, agentIconColor)}
							className='!text-violet-600 border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:!text-violet-400 dark:border-violet-500/30 dark:hover:bg-violet-950/20'>
							<Play size={15} className='fill-current' />
							Preview
						</MainAppBarPillButton>
					</MainAppBar>

					<main className='min-h-0 flex-1 overflow-y-auto'>
						<motion.div
							initial={{ y: 18, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
							className='mx-auto flex min-h-full w-full max-w-[1120px] flex-col px-5 pt-10 pb-5 sm:px-8 sm:pt-12 lg:px-10 lg:pt-14'>
							
							{/* Hero Banner Section */}
							<section className='relative z-10 overflow-hidden rounded-3xl border border-violet-100/50 bg-linear-to-tr from-violet-500/5 via-indigo-500/5 to-purple-500/5 p-6 sm:p-8 lg:p-10 dark:border-zinc-800/80 dark:from-zinc-900/40 dark:via-zinc-900/30 dark:to-zinc-950/20'>
								{/* Background glow overlay */}
								<div className='pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-600/5' />

								{/* Robot badge */}
								<div className='relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg dark:bg-zinc-900 dark:border dark:border-white/10'>
									<Bot size={28} strokeWidth={2} />
								</div>

								{/* Title */}
								<h1 className='text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl dark:text-white'>
									Build your <span className='bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-300'>agent</span>
								</h1>

								{/* Description */}
								<p className='mt-3 max-w-2xl text-xs font-semibold text-zinc-500 sm:text-sm lg:text-md dark:text-zinc-400'>
									Choose an agent template or simply describe what you need to get started.
								</p>

								{/* Describe Agent Input Box */}
								<div className='mt-8 max-w-2xl'>
									<div className='relative flex items-center rounded-full border border-zinc-200/80 bg-white p-1.5 shadow-sm transition-all focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/5 dark:border-zinc-800 dark:bg-zinc-900/60'>
										<input
											type='text'
											placeholder='Describe what your agent should do...'
											value={promptText}
											onChange={(e) => setPromptText(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													handleSendMessage();
												}
											}}
											className='flex-1 bg-transparent px-4 py-2 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none border-none focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500'
										/>
										<button
											type='button'
											onClick={handleSendMessage}
											className='flex items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-700 active:scale-95 dark:shadow-none'>
											<Sparkles size={13} />
											Generate agent
										</button>
									</div>
								</div>
							</section>

							{/* Templates Section */}
							<section className='relative z-10 mt-12 sm:mt-14 lg:mt-16'>
								<div className='mb-5 flex items-center justify-between gap-4'>
									<div className='flex items-center gap-2.5'>
										<h2 className='text-lg font-black tracking-tight sm:text-xl dark:text-zinc-50'>
											Templates
										</h2>
										<span className='text-zinc-650 inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-black dark:bg-zinc-900 dark:text-zinc-400'>
											{filteredTemplates.length} Available
										</span>
									</div>
									<button
										type='button'
										className='shrink-0 text-xs font-bold text-zinc-400 transition hover:text-zinc-950 sm:text-sm dark:text-zinc-500 dark:hover:text-zinc-200'>
										Don't show again
									</button>
								</div>

								{/* Categories Tab Bar */}
								<div className='text-zinc-450 flex gap-5 overflow-x-auto border-b border-zinc-200/80 text-[13px] font-black whitespace-nowrap sm:gap-6 sm:text-sm dark:border-zinc-800/80 dark:text-zinc-500'>
									{agentTemplateTabs.map((tab) => {
										const isActive = tab === activeTab;
										return (
											<button
												key={tab}
												type='button'
												onClick={() => setActiveTab(tab)}
												className={`relative pb-4 transition-colors ${
													isActive
														? 'text-zinc-950 dark:text-white'
														: 'hover:text-zinc-800 dark:hover:text-zinc-300'
												}`}>
												{tab}
												{isActive && (
													<motion.div
														layoutId='activeTabUnderline'
														className='absolute right-0 bottom-0 left-0 h-0.5 bg-violet-600 dark:bg-violet-400'
														transition={{
															type: 'spring',
															stiffness: 380,
															damping: 30,
														}}
													/>
												)}
											</button>
										);
									})}
								</div>

								{/* Template Grid */}
								<div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5'>
									<AnimatePresence mode='popLayout'>
										{filteredTemplates.map((template) => (
											<motion.div
												layout
												key={template.title}
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.95 }}
												transition={{ duration: 0.2 }}>
												<AgentTemplateCard
													template={template}
													onClick={() => handleTemplateClick(template.title)}
												/>
											</motion.div>
										))}
									</AnimatePresence>
								</div>
							</section>

							{/* Chat Console Cockpit */}
							<section className='relative z-10 mt-12 lg:mt-14'>
								{/* Prompt Suggestions */}
								<div className='mb-4 flex flex-wrap items-center gap-3'>
									<span className='text-xs font-semibold text-zinc-400 dark:text-zinc-500'>Quick starters</span>
									{suggestionChips.map((chip) => {
										const ChipIcon = chip.icon;
										return (
											<button
												key={chip.label}
												type='button'
												onClick={() => handleChipClick(chip.text)}
												className='text-zinc-650 hover:text-zinc-950 inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/70 px-4 py-1.5 text-[11px] font-black shadow-2xs backdrop-blur-xs transition-all hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'>
												<ChipIcon size={12} className='text-violet-500' />
												{chip.label}
											</button>
										);
									})}
								</div>

								{/* Cockpit Shell */}
								<div className='relative flex items-center rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/5 dark:border-zinc-800 dark:bg-zinc-900/60'>
									<div className='flex h-10 w-10 shrink-0 items-center justify-center text-violet-500'>
										<Sparkles size={18} />
									</div>
									<input
										ref={textareaRef as any}
										type='text'
										value={promptText}
										onChange={(e) => setPromptText(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												handleSendMessage();
											}
										}}
										placeholder='Send a message to your agent...'
										className='flex-1 bg-transparent px-2 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none border-none focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500'
									/>
									<button
										type='button'
										onClick={handleSendMessage}
										className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md transition hover:bg-violet-700 active:scale-95'>
										<Send size={15} />
									</button>
								</div>
							</section>

							<div className='pointer-events-none mt-auto h-6' />
						</motion.div>
					</main>

					<div className='pointer-events-none absolute right-10 bottom-8 hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 xl:flex dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'>
						<Sparkles size={16} />
						Agent draft ready
					</div>
				</>
			) : (
				// Premium Chat Interface View (from user screenshot)
				<div className='flex min-h-0 flex-1 flex-col bg-zinc-50/20 dark:bg-zinc-950/80'>
					{/* Chat Header */}
					<header className='flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-2xs backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/90'>
						<div className='flex items-center gap-3 min-w-0'>
							{/* Back button */}
							<button
								onClick={() => setIsPreviewMode(false)}
								className='flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-450 dark:hover:bg-white/[0.07] dark:hover:text-white'>
								<X size={16} />
							</button>

							{/* Agent Avatar */}
							<div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-md dark:bg-zinc-900 dark:border dark:border-white/10`}>
								<AgentIconComponent size={20} className={getIconColorClass(agentIconColor)} />
							</div>

							{/* Agent name & status */}
							<div className='flex flex-col min-w-0'>
								<div className='flex items-center gap-1.5'>
									<span className='truncate text-[14px] font-black tracking-tight text-zinc-900 dark:text-white'>
										{agentName}
									</span>
									<button className='text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'>
										<SquarePen size={12} />
									</button>
								</div>
								<div className='flex items-center gap-1.5'>
									<span className='h-2 w-2 rounded-full bg-emerald-500' />
									<span className='text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
										Active
									</span>
								</div>
							</div>
						</div>

						{/* Action Buttons Right */}
						<div className='flex items-center gap-2'>
							<MainAppBarPillButton onClick={() => toast.success('Share link copied!')}>
								<Share2 size={14} />
								<span>Share</span>
							</MainAppBarPillButton>
							
							<MainAppBarIconButton title='Settings' onClick={() => { setActiveSidebarTab('agent'); setIsSettingsOpen(true); }}>
								<SlidersHorizontal size={14} />
							</MainAppBarIconButton>

							<div className='relative'>
								<MainAppBarIconButton title='More options' onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}>
									<MoreHorizontal size={14} />
								</MainAppBarIconButton>
								<AnimatePresence>
									{isMoreDropdownOpen && (
										<>
											{/* Click outside backdrop */}
											<div className='fixed inset-0 z-40' onClick={() => setIsMoreDropdownOpen(false)} />
											
											{/* Dropdown Menu */}
											<motion.div
												initial={{ opacity: 0, y: 8, scale: 0.95 }}
												animate={{ opacity: 1, y: 0, scale: 1 }}
												exit={{ opacity: 0, y: 8, scale: 0.95 }}
												transition={{ duration: 0.15, ease: 'easeOut' }}
												className='absolute right-0 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg z-50 dark:border-white/10 dark:bg-zinc-900'>
												<button
													onClick={() => {
														setIsMoreDropdownOpen(false);
														const greeting = `Hi! I'm your ${agentName}. How can I help you today?`;
														setChatHistory([
															{
																id: 'init-' + Date.now(),
																sender: 'agent',
																text: greeting,
																timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
																type: 'text',
															},
														]);
														toast.success('Chat history cleared!');
													}}
													className='flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/[0.04] transition-colors'>
													<RotateCcw size={13} />
													Reset Chat History
												</button>
												
												<button
													onClick={() => {
														setIsMoreDropdownOpen(false);
														const agentConfig = {
															name: agentName,
															description: agentDescription,
															instructions: agentInstructions,
															color: agentIconColor,
															connectedApps: connectedApps.filter(app => app.isConnected).map(app => app.name),
														};
														const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(agentConfig, null, 2));
														const downloadAnchor = document.createElement('a');
														downloadAnchor.setAttribute("href", dataStr);
														downloadAnchor.setAttribute("download", `${agentName.toLowerCase().replace(/\s+/g, '-')}-config.json`);
														document.body.appendChild(downloadAnchor);
														downloadAnchor.click();
														downloadAnchor.remove();
														toast.success('Agent configuration exported!');
													}}
													className='flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/[0.04] transition-colors'>
													<FileJson size={13} />
													Export Agent JSON
												</button>
												
												<div className='my-1 border-t border-zinc-100 dark:border-white/5' />
												
												<button
													onClick={() => {
														setIsMoreDropdownOpen(false);
														setIsPreviewMode(false);
														setAgentName('Lead Generation Agent');
														setAgentDescription('An agent that helps me research competitors...');
														setAgentInstructions('');
														setAgentIcon(Bot);
														setAgentIconColor('purple');
														toast.error('Agent draft reset/deleted.');
													}}
													className='flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/20 transition-colors'>
													<Trash2 size={13} />
													Delete Agent Draft
												</button>
											</motion.div>
										</>
									)}
								</AnimatePresence>
							</div>

							<button
								onClick={() => setIsPreviewMode(false)}
								className='flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-4 text-xs font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700 transition active:scale-95 dark:shadow-none'>
								<SquarePen size={13} />
								<span>Edit Draft</span>
							</button>
						</div>
					</header>

					{/* Chat Message Box */}
					<div className='flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-4xl w-full mx-auto space-y-6'>
						{chatHistory.map((message) => {
							const isUser = message.sender === 'user';
							return (
								<div key={message.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
									<div className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
										{/* Agent Avatar in body */}
										{!isUser && (
											<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white border dark:border-white/10 dark:bg-zinc-900`}>
												<AgentIconComponent size={16} className={getIconColorClass(agentIconColor)} />
											</div>
										)}

										<div className='flex flex-col min-w-0'>
											{/* Chat bubble */}
											<div className={`rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed ${
												isUser
													? 'bg-violet-600/10 text-zinc-950 dark:bg-violet-500/25 dark:text-zinc-100 rounded-tr-none'
													: 'bg-white text-zinc-800 border border-zinc-200/80 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-zinc-800/85 rounded-tl-none shadow-2xs'
											}`}>
												<p className='whitespace-pre-line'>{message.text}</p>

												{/* Structured Table for data responses */}
												{message.type === 'table' && message.headers && message.data && (
													<div className='mt-4 overflow-hidden rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950'>
														<div className='overflow-x-auto'>
															<table className='w-full text-left text-xs font-semibold text-zinc-650 dark:text-zinc-400'>
																<thead className='bg-zinc-50/50 text-[11px] font-black uppercase tracking-wider text-zinc-600 border-b border-zinc-200 dark:bg-zinc-900/40 dark:text-zinc-400 dark:border-zinc-800'>
																	<tr>
																		{message.headers.map((h) => (
																			<th key={h} className='px-4 py-2.5 font-bold'>{h}</th>
																		))}
																	</tr>
																</thead>
																<tbody className='divide-y divide-zinc-200/80 dark:divide-zinc-800'>
																	{message.data.map((row, rIdx) => (
																		<tr key={rIdx} className='hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20'>
																			{message.headers!.map((h) => (
																				<td key={h} className='px-4 py-2.5 text-zinc-900 dark:text-zinc-100 whitespace-nowrap'>
																					{row[h]}
																				</td>
																			))}
																		</tr>
																	))}
																</tbody>
															</table>
														</div>
													</div>
												)}

												{/* Follow up text */}
												{message.followUp && (
													<p className='mt-4 text-xs font-bold text-zinc-500 dark:text-zinc-400'>
														{message.followUp}
													</p>
												)}
											</div>

											{/* Action Buttons for agent messages */}
											{!isUser && message.actions && message.actions.length > 0 && (
												<div className='mt-3.5 flex flex-wrap gap-2.5'>
													{message.actions.map((act) => {
														let IconComp = Sparkles;
														if (act.type === 'export_csv' || act.type === 'pdf_digest') IconComp = Download;
														if (act.type === 'refine' || act.type === 'set_alert') IconComp = SlidersHorizontal;

														return (
															<button
																key={act.label}
																onClick={() => handleActionClick(act)}
																className='inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-black text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/80 transition active:scale-95'>
																<IconComp size={12} className='text-violet-500' />
																<span>{act.label}</span>
															</button>
														);
													})}
												</div>
											)}

											{/* Timestamp */}
											<span className={`text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
												{message.timestamp}
											</span>
										</div>
									</div>
								</div>
							);
						})}

						{/* Typing indicator bubble */}
						{isTyping && (
							<div className='flex w-full justify-start'>
								<div className='flex gap-3 max-w-[80%] flex-row'>
									<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white border dark:border-white/10 dark:bg-zinc-900`}>
										<AgentIconComponent size={16} className={getIconColorClass(agentIconColor)} />
									</div>
									<div className='rounded-2xl px-4 py-3 bg-white border border-zinc-200/80 dark:bg-zinc-900/60 dark:border-zinc-800/85 rounded-tl-none shadow-2xs flex items-center justify-center gap-1.5'>
										<div className='w-2.5 h-2.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.3s]' />
										<div className='w-2.5 h-2.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]' />
										<div className='w-2.5 h-2.5 rounded-full bg-violet-500 animate-bounce' />
									</div>
								</div>
							</div>
						)}

						<div ref={chatEndRef} />
					</div>

					{/* Chat Footer Input Area */}
					<footer className='border-t border-zinc-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-zinc-950/90'>
						<div className='mx-auto max-w-4xl w-full flex flex-col gap-3'>
							<div className='relative flex items-center rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xs focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/5 dark:border-zinc-800 dark:bg-zinc-900/60'>
								{/* Left attachments & skill checkbox */}
								<div className='flex items-center gap-1 px-1.5'>
									<button
										title='Attach files'
										className='flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'>
										<Paperclip size={18} />
									</button>

									{/* Skill checkbox */}
									<button
										onClick={() => setSkillEnabled(!skillEnabled)}
										title='Toggle Skills'
										className='flex h-9 items-center gap-1.5 rounded-lg border border-zinc-150 bg-zinc-50/50 px-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400 dark:hover:bg-zinc-800'>
										{skillEnabled ? (
											<CheckSquare size={14} className='text-violet-600 dark:text-violet-400' />
										) : (
											<Square size={14} />
										)}
										<span>Skill</span>
									</button>
								</div>

								{/* Chat Input */}
								<input
									type='text'
									value={chatInput}
									onChange={(e) => setChatInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											if (chatInput.trim()) {
												sendChatMessage(chatInput);
												setChatInput('');
											}
										}
									}}
									placeholder='Send a message to your agent...'
									className='flex-1 bg-transparent px-3 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none border-none focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500'
								/>

								{/* Right features: Incognito & Send */}
								<div className='flex items-center gap-3 px-1.5'>
									{/* Incognito toggle switch */}
									<div className='flex items-center gap-2'>
										<button
											onClick={() => setIncognito(!incognito)}
											className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
												incognito ? 'bg-zinc-800 dark:bg-zinc-700' : 'bg-zinc-200 dark:bg-zinc-800'
											}`}>
											<span
												className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
													incognito ? 'translate-x-4' : 'translate-x-0'
												}`}
											/>
										</button>
										<div className='flex items-center gap-1 text-[11px] font-black text-zinc-400 dark:text-zinc-500'>
											<Ghost size={12} className={incognito ? 'text-zinc-700 dark:text-zinc-300' : ''} />
											<span>Incognito</span>
										</div>
									</div>

									{/* Mic icon */}
									<button
										title='Voice input'
										className='flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-550 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'>
										<Mic size={18} />
									</button>

									{/* Send Button */}
									<button
										onClick={() => {
											if (chatInput.trim()) {
												sendChatMessage(chatInput);
												setChatInput('');
											}
										}}
										className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-md transition hover:bg-violet-700 active:scale-95'>
										<ArrowUp size={16} strokeWidth={2.5} />
									</button>
								</div>
							</div>
							
							<div className='flex items-center justify-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500'>
								<span>Agent can make mistakes. Please verify important information.</span>
								<button className='underline hover:text-zinc-700 dark:hover:text-zinc-300'>Report an issue</button>
							</div>
						</div>
					</footer>
				</div>
			)}

			{/* Settings Sidebar Drawer */}
			<AnimatePresence>
				{isSettingsOpen && (
					<>
						{/* Backdrop Overlay */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsSettingsOpen(false)}
							className='fixed inset-0 z-50 bg-black/15 backdrop-blur-xs'
						/>

						{/* Sidebar Drawer */}
						<motion.div
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: 'spring', damping: 25, stiffness: 220 }}
							className='fixed right-0 top-0 bottom-0 z-55 flex w-full max-w-[480px] flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900 overflow-hidden'
						>
							{/* Header Tabs */}
							<div className='flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-white/10 dark:bg-zinc-900'>
								<div className='flex gap-2 h-full items-end'>
									{/* Tab: Agent */}
									<button 
										onClick={() => setActiveSidebarTab('agent')}
										className={`flex items-center gap-1.5 px-3 pb-4 text-xs font-bold transition-all border-b-2 ${
											activeSidebarTab === 'agent'
												? 'text-violet-600 border-violet-600 dark:text-violet-400 dark:border-violet-400'
												: 'text-zinc-400 border-transparent hover:text-zinc-655 dark:text-zinc-500 dark:hover:text-zinc-305'
										}`}
									>
										<Bot size={14} />
										<span>Agent</span>
									</button>
									{/* Tab: Settings */}
									<button 
										onClick={() => setActiveSidebarTab('settings')}
										className={`flex items-center gap-1.5 px-3 pb-4 text-xs font-bold transition-all border-b-2 ${
											activeSidebarTab === 'settings'
												? 'text-violet-600 border-violet-600 dark:text-violet-400 dark:border-violet-400'
												: 'text-zinc-400 border-transparent hover:text-zinc-655 dark:text-zinc-500 dark:hover:text-zinc-305'
										}`}
									>
										<SlidersHorizontal size={14} />
										<span>Settings</span>
									</button>
									{/* Tab: Chat Details */}
									<button 
										onClick={() => setActiveSidebarTab('chatDetails')}
										className={`flex items-center gap-1.5 px-3 pb-4 text-xs font-bold transition-all border-b-2 ${
											activeSidebarTab === 'chatDetails'
												? 'text-violet-600 border-violet-600 dark:text-violet-400 dark:border-violet-400'
												: 'text-zinc-400 border-transparent hover:text-zinc-655 dark:text-zinc-500 dark:hover:text-zinc-305'
										}`}
									>
										<MessageSquare size={14} />
										<span>Chat Details</span>
									</button>
								</div>

								{/* Top Right Action (Back/Undo & Save) */}
								<div className='flex items-center gap-2'>
									<button 
										onClick={() => setIsSettingsOpen(false)}
										title="Go back"
										className='flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-955 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'>
										<Undo2 size={14} />
									</button>
									<button 
										onClick={() => {
											toast.success('Agent configuration saved!');
											setIsSettingsOpen(false);
										}}
										className='flex h-8 items-center gap-1 rounded-lg bg-violet-600 px-3 text-[11px] font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700 transition active:scale-95 dark:shadow-none'>
										<CheckCircle2 size={13} />
										<span>Save</span>
									</button>
								</div>
							</div>

							{/* Settings Body - Render conditionally based on activeSidebarTab */}
							{activeSidebarTab === 'agent' && (
								<div className='flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/20'>
									
									{/* Agent Preferences Section */}
									<div className='rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-4'>
										{/* Preferences Header */}
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-1.5 cursor-pointer'>
												<ChevronDown size={16} className='text-zinc-500' />
												<h3 className='text-sm font-black text-zinc-900 dark:text-white'>Agent Preferences</h3>
											</div>
											<button className='inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-bold text-zinc-655 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'>
												<span>Advanced</span>
												<SlidersHorizontal size={10} />
											</button>
										</div>

										{/* Model Selector Card */}
										<div className='flex items-center justify-between rounded-xl border border-zinc-150 p-3 bg-zinc-50/20 dark:border-zinc-800 dark:bg-zinc-950/20 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition'>
											<div className='flex items-center gap-3'>
												<div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400'>
													<Sparkles size={16} fill="currentColor" />
												</div>
												<div className='flex flex-col'>
													<span className='text-[10px] font-black tracking-wide text-zinc-450 uppercase'>Recommended Model</span>
													<span className='text-xs font-black text-zinc-800 dark:text-zinc-200'>Gemini 3.5 Flash</span>
												</div>
											</div>
											<ChevronDown size={14} className='text-zinc-400' />
										</div>

										{/* Instructions Textarea */}
										<div className='flex flex-col'>
											<textarea
												rows={3}
												value={agentInstructions}
												onChange={(e) => setAgentInstructions(e.target.value.substring(0, 4000))}
												placeholder='Add instructions for the agent...'
												className='w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs font-semibold text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 dark:border-zinc-800 dark:bg-zinc-950/25 dark:text-zinc-200 dark:placeholder:text-zinc-550 focus:outline-none focus:ring-0 focus:ring-offset-0'
											/>
											<span className='text-[10px] font-bold text-zinc-455 dark:text-zinc-500 text-right mt-1.5'>
												{agentInstructions.length} / 4000
											</span>
										</div>

										{/* Allow Self-Updates Row */}
										<div className='flex items-center justify-between rounded-xl border border-zinc-150 p-3 bg-zinc-50/20 dark:border-zinc-800 dark:bg-zinc-950/20'>
											<div className='flex items-center gap-3'>
												<div className='flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/5 dark:text-purple-400'>
													<SquarePen size={16} />
												</div>
												<div className='flex flex-col pr-4'>
													<span className='text-xs font-black text-zinc-800 dark:text-zinc-200'>Allow Self-Updates</span>
													<span className='text-[10px] font-semibold text-zinc-455 dark:text-zinc-400 mt-0.5 leading-normal'>Let the agent improve its knowledge and instructions automatically.</span>
												</div>
											</div>
											<button
												onClick={() => setAllowSelfUpdates(!allowSelfUpdates)}
												className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
													allowSelfUpdates ? 'bg-violet-600 dark:bg-violet-500' : 'bg-zinc-200 dark:bg-zinc-800'
												}`}>
												<span
													className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
														allowSelfUpdates ? 'translate-x-4' : 'translate-x-0'
													}`}
												/>
											</button>
										</div>
									</div>

									{/* Triggers Section */}
									<div className='rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-2'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div className='flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-500/5 dark:text-violet-400'>
													<Zap size={14} fill="currentColor" />
												</div>
												<div className='flex items-center gap-2'>
													<h4 className='text-xs font-black text-zinc-900 dark:text-white'>Triggers</h4>
													<span className='inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 px-2 py-0.5 rounded-full'>
														<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
														<span>AI Managed: ON</span>
													</span>
												</div>
											</div>
											<button onClick={() => toast.info('Trigger creation opened')} className='flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-black text-violet-600 hover:bg-zinc-50 dark:border-violet-500/20 dark:bg-zinc-900 dark:text-violet-400 dark:hover:bg-zinc-800'>
												<Plus size={10} />
												<span>Trigger</span>
											</button>
										</div>
										<p className='text-[10px] font-semibold text-zinc-455 dark:text-zinc-500 pl-9'>
											Define events or conditions that activate this agent.
										</p>
									</div>

									{/* Apps Section */}
									<div className='rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div className='flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400'>
													<Layers size={14} />
												</div>
												<div className='flex items-center gap-2'>
													<h4 className='text-xs font-black text-zinc-900 dark:text-white'>Apps</h4>
													<span className='inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 px-2 py-0.5 rounded-full'>
														<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
														<span>AI Discovery: ON</span>
													</span>
												</div>
											</div>
											<button 
												onClick={() => {
													setAppSearchQuery('');
													setAppCategory('all');
													setIsAddAppOpen(true);
												}} 
												className='flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-black text-violet-600 hover:bg-zinc-50 dark:border-violet-500/20 dark:bg-zinc-900 dark:text-violet-400 dark:hover:bg-zinc-800'>
												<Plus size={10} />
												<span>App</span>
											</button>
										</div>

										{/* App List */}
										<div className='space-y-2 pl-9'>
											{connectedApps.map((app) => {
												const AppIcon = app.icon;
												return (
													<div key={app.id} className='flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80 last:border-0'>
														<div className='flex items-center gap-3'>
															<div className={`flex h-8 w-8 items-center justify-center rounded-lg ${app.iconBg} text-white`}>
																<AppIcon size={15} />
															</div>
															<div className='flex flex-col'>
																<span className='text-xs font-black text-zinc-800 dark:text-zinc-200'>{app.name}</span>
																<span className='text-[10px] font-semibold text-zinc-455 dark:text-zinc-500 leading-tight mt-0.5'>{app.desc}</span>
															</div>
														</div>
														<div className='flex items-center gap-2'>
															{!app.isConnected && app.id === 'google-docs' ? (
																<button
																	onClick={() => {
																		setConnectedApps(prev => prev.map(a => a.id === 'google-docs' ? { ...a, isConnected: true } : a));
																		toast.success('Google Docs connected successfully!');
																	}}
																	className='px-2.5 py-1 border border-violet-200 text-violet-600 bg-violet-50 text-[10px] font-bold rounded-lg hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 animate-pulse'>
																	Connect
																</button>
															) : (
																<ChevronRight size={14} className='text-zinc-400' />
															)}
															<button className='text-zinc-400 hover:text-zinc-700 p-1 dark:hover:text-zinc-250'><MoreHorizontal size={14}/></button>
														</div>
													</div>
												);
											})}
										</div>
									</div>

									{/* Skills Section */}
									<div className='rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-2'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div className='flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/5 dark:text-purple-400'>
													<Cpu size={14} />
												</div>
												<div className='flex items-center gap-2'>
													<h4 className='text-xs font-black text-zinc-900 dark:text-white'>Skills</h4>
													<span className='inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 px-2 py-0.5 rounded-full'>
														<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
														<span>AI Skill Editing: ON</span>
													</span>
												</div>
											</div>
											<button onClick={() => toast.info('Skill configuration opened')} className='flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-black text-violet-600 hover:bg-zinc-50 dark:border-violet-500/20 dark:bg-zinc-900 dark:text-violet-400 dark:hover:bg-zinc-800'>
												<Plus size={10} />
												<span>Skill</span>
											</button>
										</div>
										<p className='text-[10px] font-semibold text-zinc-455 dark:text-zinc-550 pl-9'>
											Add custom skills to extend your agent's abilities.
										</p>
									</div>

									{/* Subagents Section */}
									<div className='rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<div className='flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-500/5 dark:text-violet-400'>
													<Users size={14} />
												</div>
												<h4 className='text-xs font-black text-zinc-900 dark:text-white'>Subagents</h4>
											</div>
											<button onClick={() => toast.info('Subagent creation dialog opened')} className='flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-black text-violet-600 hover:bg-zinc-50 dark:border-violet-500/20 dark:bg-zinc-900 dark:text-violet-400 dark:hover:bg-zinc-800'>
												<Plus size={10} />
												<span>Subagent</span>
											</button>
										</div>
										<p className='text-[10px] font-semibold text-zinc-455 dark:text-zinc-550 pl-9'>
											Delegate tasks to specialized subagents.
										</p>

										{/* Subagent Item */}
										<div className='flex items-center justify-between py-2 border border-zinc-150 rounded-xl p-3 bg-zinc-50/20 dark:border-zinc-800 dark:bg-zinc-950/20 pl-9'>
											<div className='flex items-center gap-3'>
												<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-zinc-800 dark:border dark:border-zinc-700'>
													<Bot size={15} />
												</div>
												<div className='flex flex-col'>
													<span className='text-xs font-black text-zinc-800 dark:text-zinc-200'>Competitor Research Agent (Me)</span>
													<span className='text-[10px] font-semibold text-zinc-455 dark:text-zinc-550 leading-tight mt-0.5'>Enables me to clone myself as a subagent to research competitors.</span>
												</div>
											</div>
											<button className='text-zinc-400 hover:text-zinc-700 p-1 dark:hover:text-zinc-250'><MoreHorizontal size={14}/></button>
										</div>
									</div>

									{/* Bottom Autosave footer banner */}
									<div className='flex gap-3 rounded-xl bg-violet-500/5 border border-violet-500/10 p-3.5 dark:bg-violet-500/5 dark:border-violet-500/10'>
										<Sparkles size={16} className='text-violet-500 shrink-0 mt-0.5' />
										<div className='flex flex-col'>
											<span className='text-xs font-bold text-violet-700 dark:text-violet-400'>Changes are saved automatically</span>
											<span className='text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1 leading-normal'>Your agent will use the latest configuration for all new conversations.</span>
										</div>
									</div>

								</div>
							)}

							{/* Settings Tab Layout */}
							{activeSidebarTab === 'settings' && (
								<div className='flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/20'>
									
									{/* Personalization Section */}
									<div className='rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-4 shadow-2xs'>
										{/* Section Header */}
										<div className='flex items-center gap-2.5 pb-2 border-b border-zinc-150 dark:border-zinc-800/80'>
											<ChevronDown size={18} className='text-zinc-500 cursor-pointer' />
											<div className='flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-650 dark:bg-violet-500/10 dark:text-violet-400'>
												<Users size={16} />
											</div>
											<h3 className='text-sm font-black text-zinc-950 dark:text-white'>Personalization</h3>
										</div>

										{/* Content Layout */}
										<div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-start'>
											
											{/* Left side: Avatar and Popover Icon Selector Grid */}
											<div className='md:col-span-5 flex flex-col items-start space-y-3 relative'>
												{/* Subheader Title */}
												<div className='space-y-0.5'>
													<h4 className='text-xs font-black text-zinc-950 dark:text-white'>Icon & Name</h4>
													<p className='text-[10px] font-semibold text-zinc-450 dark:text-zinc-500'>Choose an icon and give your agent a name.</p>
												</div>

												{/* Large Chosen Icon Avatar Box */}
												<div 
													onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
													className='relative flex h-24 w-24 items-center justify-center rounded-2xl border border-zinc-200 bg-white p-2.5 dark:border-zinc-700 dark:bg-zinc-950/45 shadow-2xs cursor-pointer select-none'
												>
													<AgentIconComponent size={44} className={getIconColorClass(agentIconColor)} />
													{/* Pencil edit badge overlay */}
													<div className='absolute -bottom-1 -right-1 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-violet-600 text-white border border-white dark:border-zinc-900 shadow-md shadow-violet-600/10 cursor-pointer'>
														<SquarePen size={11} />
													</div>
												</div>

												{/* Icon Picker Popover Container (Dropdown) */}
												<AnimatePresence>
													{isIconPickerOpen && (
														<motion.div
															initial={{ opacity: 0, y: -10 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: -10 }}
															transition={{ duration: 0.15 }}
															className='relative w-full max-w-[280px] border border-zinc-200 bg-white p-4 shadow-sm rounded-2xl space-y-4 dark:border-zinc-800 dark:bg-zinc-900/60 mt-1.5'
														>
															{/* Top pointer speech-bubble triangle */}
															<div className='absolute -top-1.5 left-9 w-3 h-3 bg-white border-t border-l border-zinc-200 rotate-45 dark:bg-zinc-900 dark:border-zinc-800' />
															
															{/* Icons Grid (10 icons) */}
															<div className='grid grid-cols-5 gap-2 relative z-10'>
																{selectableIcons.map((item, idx) => {
																	const Icon = item.Icon;
																	const isSelected = agentIcon === Icon;
																	return (
																		<button
																			key={idx}
																			type='button'
																			onClick={() => setAgentIcon(() => Icon)}
																			className={`flex h-9 w-9 items-center justify-center rounded-xl border transition active:scale-95 ${
																				isSelected
																					? 'border-violet-600 bg-violet-50 text-violet-600 dark:border-violet-400 dark:bg-violet-500/10 dark:text-violet-400'
																					: 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
																			}`}>
																			<Icon size={16} />
																		</button>
																	);
																})}
															</div>

															{/* Colors Selector */}
															<div className='space-y-1.5 relative z-10'>
																<span className='text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider'>Color</span>
																<div className='flex items-center gap-2.5'>
																	{colorsList.map((col) => {
																		const isSelected = agentIconColor === col.value;
																		return (
																			<button
																				key={col.value}
																				type='button'
																				onClick={() => setAgentIconColor(col.value)}
																				className={`h-5 w-5 rounded-full border transition flex items-center justify-center ${col.bgClass} ${
																					isSelected ? 'ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-zinc-900 bg-clip-content p-[1px]' : 'border-zinc-200 dark:border-zinc-700'
																				}`}
																				title={col.value}>
																				{col.value === 'rainbow' && (
																					<div className='h-full w-full rounded-full bg-gradient-to-tr from-violet-500 via-emerald-500 to-rose-500' />
																				)}
																			</button>
																		);
																	})}
																</div>
															</div>
														</motion.div>
													)}
												</AnimatePresence>
											</div>

											{/* Right side: Input text name & description */}
											<div className='md:col-span-7 space-y-4 w-full pt-12 md:pt-0'>
												{/* Agent Name input field */}
												<div className='space-y-1.5 w-full'>
													<label className='text-[11px] font-black text-zinc-500 dark:text-zinc-400'>Agent Name</label>
													<div className='relative flex items-center rounded-xl border border-zinc-200 bg-white px-3.5 py-3 shadow-2xs focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/5 dark:border-zinc-800 dark:bg-zinc-950/20'>
														<input
															type='text'
															value={agentName}
															onChange={(e) => setAgentName(e.target.value.substring(0, 50))}
															className='flex-1 bg-transparent text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none border-none focus:ring-0 p-0 dark:text-zinc-100'
															placeholder='Name your agent...'
														/>
														<span className='text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0'>{agentName.length} / 50</span>
													</div>
												</div>

												{/* Description textarea box */}
												<div className='space-y-1.5 w-full'>
													<div className='flex flex-col'>
														<label className='text-[11px] font-black text-zinc-650 dark:text-zinc-300'>Description</label>
														<span className='text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5'>Describe what your agent does and how it helps you.</span>
													</div>
													{/* Border wrapping both textarea and character count at bottom right */}
													<div className='relative flex flex-col rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/5 dark:border-zinc-800 dark:bg-zinc-950/20'>
														<textarea
															rows={4}
															value={agentDescription}
															onChange={(e) => setAgentDescription(e.target.value.substring(0, 500))}
															className='w-full bg-transparent resize-none border-none outline-none focus:ring-0 p-0 text-xs font-semibold text-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500 focus:outline-none'
															placeholder='Describe agent capability...'
														/>
														<span className='text-[10px] font-bold text-zinc-400 dark:text-zinc-500 text-right mt-2 self-end'>
															{agentDescription.length} / 500
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* List of sub-setting options rows */}
									<div className='space-y-2.5'>
										{/* Agent Details */}
										<div className='flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs hover:bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-900/40 transition cursor-pointer'>
											<div className='flex items-center gap-3 min-w-0'>
												<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/5 dark:text-violet-400'>
													<Zap size={16} />
												</div>
												<div className='flex flex-col min-w-0'>
													<span className='text-xs font-black text-zinc-855 dark:text-zinc-200'>Agent Details</span>
													<span className='truncate text-[10px] font-semibold text-zinc-455 dark:text-zinc-500 leading-tight mt-0.5'>Configure core information and capabilities of your agent.</span>
												</div>
											</div>
											<div className='flex items-center gap-2.5 shrink-0'>
												<button
													type='button'
													onClick={(e) => {
														e.stopPropagation();
														toast.success('Agent copy created successfully!');
													}}
													className='flex items-center gap-1.5 px-3 py-1 border border-zinc-250 text-zinc-700 bg-white hover:bg-zinc-50 text-[10px] font-black rounded-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900'>
													<Copy size={11} />
													<span>Make a Copy</span>
												</button>
												<ChevronRight size={14} className='text-zinc-400' />
											</div>
										</div>

										{/* Chat Preferences */}
										<div className='flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs hover:bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-900/40 transition cursor-pointer'>
											<div className='flex items-center gap-3 min-w-0'>
												<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400'>
													<MessageSquare size={16} />
												</div>
												<div className='flex flex-col min-w-0'>
													<span className='text-xs font-black text-zinc-855 dark:text-zinc-200'>Chat Preferences</span>
													<span className='truncate text-[10px] font-semibold text-zinc-455 dark:text-zinc-500 leading-tight mt-0.5'>Customize how your agent communicates and responds.</span>
												</div>
											</div>
											<ChevronRight size={14} className='text-zinc-400' />
										</div>

										{/* Slack Preferences */}
										<div className='flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs hover:bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-900/40 transition cursor-pointer'>
											<div className='flex items-center gap-3 min-w-0'>
												<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400'>
													<Layers size={16} />
												</div>
												<div className='flex flex-col min-w-0'>
													<span className='text-xs font-black text-zinc-855 dark:text-zinc-200'>Slack Preferences</span>
													<span className='truncate text-[10px] font-semibold text-zinc-455 dark:text-zinc-500 leading-tight mt-0.5'>Configure how your agent interacts in Slack.</span>
												</div>
											</div>
											<ChevronRight size={14} className='text-zinc-400' />
										</div>

										{/* Secrets */}
										<div className='flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs hover:bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-900/40 transition cursor-pointer'>
											<div className='flex items-center gap-3 min-w-0'>
												<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400'>
													<Lock size={16} />
												</div>
												<div className='flex flex-col min-w-0'>
													<span className='text-xs font-black text-zinc-855 dark:text-zinc-200'>Secrets</span>
													<span className='truncate text-[10px] font-semibold text-zinc-455 dark:text-zinc-500 leading-tight mt-0.5'>Manage API keys, tokens, and other sensitive information.</span>
												</div>
											</div>
											<ChevronRight size={14} className='text-zinc-400' />
										</div>

										{/* Danger Zone */}
										<div className='flex items-center justify-between rounded-xl border border-rose-200 bg-white p-3.5 shadow-2xs hover:bg-rose-50/20 dark:border-rose-955/40 dark:bg-zinc-900/40 transition cursor-pointer'>
											<div className='flex items-center gap-3 min-w-0'>
												<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/5 dark:text-rose-455'>
													<AlertTriangle size={16} />
												</div>
												<div className='flex flex-col min-w-0'>
													<span className='text-xs font-black text-rose-600 dark:text-rose-400'>Danger Zone</span>
													<span className='truncate text-[10px] font-semibold text-zinc-455 dark:text-rose-955/40 leading-tight mt-0.5'>Irreversible actions that can affect your agent.</span>
												</div>
											</div>
											<ChevronRight size={14} className='text-rose-400' />
										</div>
									</div>

									{/* Bottom secure banner */}
									<div className='flex items-center justify-between rounded-xl bg-violet-500/5 border border-violet-500/10 p-3.5 dark:bg-violet-500/5 dark:border-violet-500/10'>
										<div className='flex gap-3'>
											<Shield size={16} className='text-violet-500 shrink-0 mt-0.5' />
											<div className='flex flex-col'>
												<span className='text-xs font-bold text-violet-700 dark:text-violet-400'>Your settings are secure</span>
												<span className='text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1 leading-normal'>All changes are saved automatically and encrypted.</span>
											</div>
										</div>
										<a
											href='#'
											onClick={(e) => {
												e.preventDefault();
												toast.info('Secure credentials document opened.');
											}}
											className='text-[10px] font-bold text-violet-600 hover:underline flex items-center gap-1 shrink-0 dark:text-violet-400'>
											<span>Learn more</span>
											<ExternalLink size={10} />
										</a>
									</div>

								</div>
							)}

							{/* Chat Details Tab */}
							{activeSidebarTab === 'chatDetails' && (
								<div className='flex-1 overflow-y-auto p-4 bg-zinc-50/40 dark:bg-zinc-950/20 flex flex-col items-center justify-center text-center space-y-3'>
									<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500'>
										<MessageSquare size={22} />
									</div>
									<h4 className='text-sm font-black text-zinc-800 dark:text-zinc-100'>No Active Chat History Details</h4>
									<p className='text-xs font-semibold text-zinc-455 dark:text-zinc-500 max-w-[280px] leading-relaxed'>
										Once this agent runs inside a production environment, conversation logs, token usage, and execution stats will be displayed here.
									</p>
								</div>
							)}

						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Add an App Drawer (Layered Overlay on top of settings drawer) */}
			<AnimatePresence>
				{isAddAppOpen && (
					<>
						{/* Subtle Dark Backdrop on settings drawer */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsAddAppOpen(false)}
							className='fixed inset-0 z-60 bg-black/20 backdrop-blur-xs'
						/>

						{/* Add App Drawer Container */}
						<motion.div
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: 'spring', damping: 25, stiffness: 220 }}
							className='fixed right-0 top-0 bottom-0 z-65 flex w-full max-w-[440px] flex-col border-l border-zinc-200 bg-white shadow-3xl dark:border-white/10 dark:bg-zinc-900 overflow-hidden'
						>
							{/* Drawer Header */}
							<div className='flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5 dark:border-white/10 dark:bg-zinc-900'>
								<h3 className='text-[16px] font-black text-zinc-900 dark:text-white'>Add an app</h3>
								<button
									onClick={() => setIsAddAppOpen(false)}
									className='flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-800'>
									<X size={18} />
								</button>
							</div>

							{/* Search & Tabs Filter Box */}
							<div className='p-4 border-b border-zinc-100 dark:border-white/10 space-y-3 dark:bg-zinc-900'>
								<div className='flex gap-3 items-center'>
									{/* Search Input */}
									<div className='flex-1 relative flex items-center rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/5 dark:border-zinc-800 dark:bg-zinc-950/20'>
										<Search size={15} className='text-zinc-400 shrink-0 ml-1.5' />
										<input
											type='text'
											value={appSearchQuery}
											onChange={(e) => setAppSearchQuery(e.target.value)}
											placeholder='Search 98 apps'
											className='flex-1 bg-transparent px-2.5 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none border-none focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-550'
										/>
									</div>

									{/* Filter Tabs (All / Custom) */}
									<div className='flex bg-zinc-100 rounded-lg p-0.5 dark:bg-zinc-950/45 shrink-0'>
										<button
											onClick={() => setAppCategory('all')}
											className={`px-3 py-1.5 text-[10px] font-black rounded-md transition ${
												appCategory === 'all'
													? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-white'
													: 'text-zinc-450 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-350'
											}`}>
											All
										</button>
										<button
											onClick={() => setAppCategory('custom')}
											className={`px-3 py-1.5 text-[10px] font-black rounded-md transition ${
												appCategory === 'custom'
													? 'bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-white'
													: 'text-zinc-450 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-350'
											}`}>
											Custom
										</button>
									</div>
								</div>
							</div>

							{/* Apps List Scrollable */}
							<div className='flex-1 overflow-y-auto p-4 space-y-3 dark:bg-zinc-950/10'>
								<h4 className='text-[10px] font-black text-zinc-450 uppercase tracking-widest pl-1'>All apps</h4>
								
								<div className='space-y-1.5'>
									{filteredAvailableApps.map((app) => {
										const AppIcon = app.icon;
										return (
											<div
												key={app.id}
												className='flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 shadow-2xs hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40 transition'>
												<div className='flex items-center gap-3'>
													<div className={`flex h-8 w-8 items-center justify-center rounded-lg ${app.iconBg} text-white shadow-2xs`}>
														<AppIcon size={16} />
													</div>
													<div className='flex flex-col'>
														<span className='text-xs font-black text-zinc-900 dark:text-zinc-100'>{app.name}</span>
														{/* Add description in mock detail */}
														<span className='text-[9px] font-semibold text-zinc-450 dark:text-zinc-500 mt-0.5 leading-tight'>{app.desc}</span>
													</div>
												</div>
												<button
													onClick={() => handleAddAppFromList(app)}
													className='flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 active:scale-90 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition shadow-2xs'>
													<Plus size={14} />
												</button>
											</div>
										);
									})}
									{filteredAvailableApps.length === 0 && (
										<div className='text-center py-8 text-xs font-bold text-zinc-400 dark:text-zinc-500'>
											No apps match "{appSearchQuery}"
										</div>
									)}
								</div>
							</div>

							{/* Save Footer Bar */}
							<div className='p-3 border-t border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 flex justify-center'>
								<button
									onClick={() => {
										toast.success('App selections saved!');
										setIsAddAppOpen(false);
									}}
									className='w-full max-w-[380px] flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-500 text-white font-bold text-xs shadow-md shadow-zinc-500/20 hover:bg-zinc-650 transition active:scale-95 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:shadow-none'>
									<span>Save ⌘ S</span>
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
};

export default BuildPage;
