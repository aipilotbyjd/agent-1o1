import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import {
	Bot,
	ChevronLeft,
	ChevronRight,
	Clock,
	Filter,
	MessageSquare,
	Search,
	Sparkles,
	Workflow,
	X,
	Coins,
	Copy,
	Check,
	ExternalLink,
	Calendar,
	Activity,
	Link2,
	MoreVertical,
	Menu,
	type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OutletContextType } from './_layouts/History.layout';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Container from '@/components/layout/Container';
import pages from '@/Routes/pages';
import useAsideStatus from '@/hooks/useAsideStatus';
import { useWorkspaceContext } from '@/context/workspaceContext';
import { useExecutions, useExecutionLogs } from '@/api/modules/executions/executions.hooks';
import type { TExecution } from '@/types/execution.type';
import dayjs from 'dayjs';

interface IHistoryItem {
	id: string;
	title: string;
	type: 'Chat' | 'Workflow run';
	timestamp: string;
	credits: number;
	status: 'Complete' | 'Failed' | 'Reviewed';
	icon: LucideIcon;
	chatTranscript?: { sender: 'user' | 'agent'; text: string }[];
}

const mockHistoryData: IHistoryItem[] = [
	{
		id: 'chat-1',
		title: 'Skill Creation',
		type: 'Chat',
		timestamp: 'May 13, 2026 • 9:00 PM',
		credits: 27,
		status: 'Complete',
		icon: Bot,
		chatTranscript: [
			{
				sender: 'user',
				text: 'Create a skill that pulls data from Slack and puts it in a Google Sheet.',
			},
			{
				sender: 'agent',
				text: "Sure! Let's build a slack-sheets integration workflow. Analyzing Slack APIs...",
			},
			{
				sender: 'agent',
				text: 'Added node `slack.listen_channels` and `google.append_rows`. Testing connection... Success!',
			},
		],
	},
	{
		id: 'chat-2',
		title: 'Skill Creator Planning',
		type: 'Chat',
		timestamp: 'May 13, 2026 • 11:14 AM',
		credits: 27,
		status: 'Complete',
		icon: Sparkles,
		chatTranscript: [
			{ sender: 'user', text: 'Summarize the design documents for the new agent workspace.' },
			{
				sender: 'agent',
				text: 'Reading files under `/workspace/docs/`... Found 3 markdown files.',
			},
			{
				sender: 'agent',
				text: 'Summary completed: Workspace uses glassmorphism and organic glows. Added steps: 1. Workspace setup, 2. Add pre-configured modules.',
			},
		],
	},
	{
		id: 'chat-3',
		title: 'Skill Creation',
		type: 'Chat',
		timestamp: 'May 13, 2026 • 10:53 AM',
		credits: 27,
		status: 'Complete',
		icon: MessageSquare,
		chatTranscript: [
			{ sender: 'user', text: 'Can you help me setup a classifier for support tickets?' },
			{
				sender: 'agent',
				text: "Sure! Let's configure a LLM bug classifier. Setting up classification prompt...",
			},
			{ sender: 'agent', text: 'Created Bug Classifier skill successfully.' },
		],
	},
	{
		id: 'run-1',
		title: 'Spreadsheet Analyst Setup',
		type: 'Workflow run',
		timestamp: 'May 9, 2026 • 10:09 PM',
		credits: 148,
		status: 'Complete',
		icon: Workflow,
		chatTranscript: [
			{ sender: 'user', text: 'Analyze our sales spreadsheet and build a summary report.' },
			{ sender: 'agent', text: 'Opening `Sales_Q1_2026.xlsx`... Reading 250 rows.' },
			{
				sender: 'agent',
				text: 'Generated Q1 Sales report. Success rate: 98.7%. Saved output as `Q1_Summary.pdf`.',
			},
		],
	},
	{
		id: 'chat-4',
		title: 'Lead Enrichment Pipeline',
		type: 'Workflow run',
		timestamp: 'May 8, 2026 • 2:15 PM',
		credits: 85,
		status: 'Complete',
		icon: Workflow,
		chatTranscript: [
			{ sender: 'user', text: 'Run the lead enrichment flow for new signups.' },
			{ sender: 'agent', text: 'Processing 45 new email leads. Enriching via Apollo API...' },
			{
				sender: 'agent',
				text: 'Completed enrichment. 42 profiles updated, 3 flagged. Logged report to Salesforce.',
			},
		],
	},
	{
		id: 'chat-5',
		title: 'GitHub Issues Classifier',
		type: 'Chat',
		timestamp: 'May 7, 2026 • 4:30 PM',
		credits: 12,
		status: 'Reviewed',
		icon: Bot,
		chatTranscript: [
			{ sender: 'user', text: 'Label recent repository issues.' },
			{ sender: 'agent', text: 'Fetching open issues from repository... Found 8 issues.' },
			{
				sender: 'agent',
				text: 'Labeled 5 as bugs, 2 as enhancements, and 1 as question. Sent Slack notification.',
			},
		],
	},
	{
		id: 'run-2',
		title: 'Database Backup Sync',
		type: 'Workflow run',
		timestamp: 'May 5, 2026 • 1:05 AM',
		credits: 220,
		status: 'Complete',
		icon: Workflow,
		chatTranscript: [
			{ sender: 'user', text: 'Backup production database to AWS S3.' },
			{
				sender: 'agent',
				text: 'Connecting to database instance... Creating snapshot backup.',
			},
			{
				sender: 'agent',
				text: 'Syncing snapshot to S3 bucket `agent1o1-db-backups`... Upload successful (1.2 GB).',
			},
		],
	},
	{
		id: 'chat-6',
		title: 'Email Campaign Sender',
		type: 'Chat',
		timestamp: 'May 3, 2026 • 6:12 PM',
		credits: 18,
		status: 'Failed',
		icon: MessageSquare,
		chatTranscript: [
			{ sender: 'user', text: 'Dispatch the weekly newsletters.' },
			{ sender: 'agent', text: 'Compiling subscriber list... Found 1,200 contacts.' },
			{
				sender: 'agent',
				text: 'Failed to send newsletters: Mailgun API rate limit exceeded. Retrying scheduled at midnight.',
			},
		],
	},
];

const ExecutionLogsViewer = ({ ws, executionId }: { ws: string; executionId: string }) => {
	const { data: logs = [], isLoading } = useExecutionLogs(ws, executionId);

	if (isLoading) {
		return (
			<div className='space-y-2.5 py-4'>
				<div className='dark:bg-zinc-800 h-4 w-3/4 animate-pulse rounded bg-slate-200' />
				<div className='dark:bg-zinc-800 h-4 w-1/2 animate-pulse rounded bg-slate-200' />
				<div className='dark:bg-zinc-800 h-4 w-5/6 animate-pulse rounded bg-slate-200' />
			</div>
		);
	}

	if (logs.length === 0) {
		return (
			<p className='py-4 text-center text-xs text-slate-400 dark:text-zinc-500'>
				No execution logs available.
			</p>
		);
	}

	return (
		<div className='border-slate-150 dark:border-zinc-800 no-scrollbar max-h-96 space-y-4 overflow-y-auto rounded-2xl border bg-slate-50/50 p-4.5 dark:bg-zinc-950/20'>
			{logs.map((log, idx) => {
				const isUser =
					log.message.startsWith('User: ') || log.message.startsWith('User Input: ');
				const isAgent =
					log.message.startsWith('Agent: ') || log.message.startsWith('Agent Response: ');
				const cleanMessage = log.message.replace(
					/^(User:|User Input:|Agent:|Agent Response:)\s*/,
					'',
				);

				if (isUser || isAgent) {
					const sender = isUser ? 'user' : 'agent';
					return (
						<div
							key={idx}
							className={`flex flex-col gap-1.5 ${
								sender === 'user' ? 'items-end' : 'items-start'
							}`}>
							<span className='text-[9px] font-black tracking-wider text-slate-400 uppercase'>
								{sender === 'user' ? 'User Input' : 'Agent Response'}
							</span>
							<div
								className={`max-w-[85%] rounded-2xl border p-3 text-xs leading-relaxed font-semibold shadow-xs ${
									sender === 'user'
										? 'rounded-tr-none border-violet-700 bg-violet-600 text-white'
										: 'text-slate-850 rounded-tl-none border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
								}`}>
								{cleanMessage}
							</div>
						</div>
					);
				}

				return (
					<div key={idx} className='flex items-start gap-2.5 text-left'>
						<span
							className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-black tracking-wider uppercase ${
								log.level === 'error'
									? 'bg-rose-100 text-rose-600 dark:bg-rose-950/25 dark:text-rose-400'
									: log.level === 'warning'
										? 'bg-amber-100 text-amber-600 dark:bg-amber-950/25 dark:text-amber-400'
										: 'text-slate-650 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400'
							}`}>
							{log.level}
						</span>
						<div className='min-w-0 flex-1'>
							<p className='text-xs leading-relaxed font-semibold break-words text-slate-700 dark:text-zinc-300'>
								{log.message}
							</p>
							{log.timestamp && (
								<span className='mt-0.5 block text-[9px] text-slate-400 dark:text-zinc-500'>
									{dayjs(log.timestamp).format('HH:mm:ss.SSS')}
								</span>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

const HistoryListPage = () => {
	const { setHeaderLeft } = useOutletContext<OutletContextType>();
	const { toggleAside } = useAsideStatus();

	useEffect(() => {
		setHeaderLeft(<Breadcrumb list={[{ ...pages.app.subPages.history }]} />);
		return () => setHeaderLeft(undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { activeWorkspaceId } = useWorkspaceContext();

	const [searchQuery, setSearchQuery] = useState('');
	const [selectedType, setSelectedType] = useState<'All' | 'Chat' | 'Workflow run'>('All');
	const [selectedItem, setSelectedItem] = useState<TExecution | IHistoryItem | null>(null);
	const [showFilters, setShowFilters] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [copied, setCopied] = useState(false);

	// Map selectedType to backend type
	const typeFilter = useMemo(() => {
		if (selectedType === 'Chat') return 'agent';
		if (selectedType === 'Workflow run') return 'workflow';
		return undefined;
	}, [selectedType]);

	const { data, isLoading, isError } = useExecutions(activeWorkspaceId, {
		page: currentPage,
		per_page: rowsPerPage,
		search: searchQuery || undefined,
		type: typeFilter,
	});

	// Fallback to mockHistoryData if API has error/no data
	const executions = useMemo(() => {
		if (isError || !data || !data.data || data.data.length === 0) {
			return mockHistoryData.filter((item) => {
				const matchesSearch =
					item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.timestamp.toLowerCase().includes(searchQuery.toLowerCase());

				const matchesType = selectedType === 'All' || item.type === selectedType;

				return matchesSearch && matchesType;
			});
		}
		return data.data;
	}, [data, isError, searchQuery, selectedType]);

	const totalItems = useMemo(() => {
		if (isError || !data || !data.data || data.data.length === 0) {
			return executions.length;
		}
		return data.meta?.total ?? data.data.length;
	}, [data, isError, executions.length]);

	const paginatedItems = useMemo(() => {
		if (isError || !data || !data.data || data.data.length === 0) {
			const startIndex = (currentPage - 1) * rowsPerPage;
			return executions.slice(startIndex, startIndex + rowsPerPage);
		}
		return executions;
	}, [executions, isError, data, currentPage, rowsPerPage]);

	const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

	// Selected Details mapper
	const selectedDetails = useMemo(() => {
		if (!selectedItem) return null;

		const isMock = 'timestamp' in selectedItem;

		if (isMock) {
			const mock = selectedItem as IHistoryItem;
			return {
				id: mock.id,
				title: mock.title,
				type: mock.type,
				timestamp: mock.timestamp,
				credits: mock.credits,
				status: mock.status,
				icon: mock.icon,
				chatTranscript: mock.chatTranscript,
			};
		} else {
			const real = selectedItem as TExecution;
			const isAgent = real.type === 'agent';

			let displayStatus = 'Pending';
			if (real.status === 'completed') displayStatus = 'Complete';
			else if (real.status === 'failed') displayStatus = 'Failed';
			else if (real.status === 'cancelled') displayStatus = 'Cancelled';
			else if (real.status) {
				displayStatus = real.status.charAt(0).toUpperCase() + real.status.slice(1);
			}

			return {
				id: real.id,
				title: isAgent
					? real.agent_name || 'Agent Run'
					: real.workflow_name || 'Workflow Run',
				type: (isAgent ? 'Chat' : 'Workflow run') as 'Chat' | 'Workflow run',
				timestamp: real.started_at
					? dayjs(real.started_at).format('MMM D, YYYY • h:mm A')
					: 'Pending',
				credits: real.credits_consumed ?? 0,
				status: displayStatus,
				icon: isAgent ? Bot : Workflow,
				chatTranscript: undefined,
			};
		}
	}, [selectedItem]);

	const handleCopyUrl = (id: string) => {
		const url = `${window.location.origin}/history?chat_id=${id}`;
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const itemStart = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
	const itemEnd = Math.min(currentPage * rowsPerPage, totalItems);

	const renderPageNumbers = () => {
		const pagesList = [];
		if (totalPages <= 5) {
			for (let i = 1; i <= totalPages; i++) {
				pagesList.push(i);
			}
		} else {
			// Show first 3 pages, ellipsis, last page
			pagesList.push(1, 2, 3);
			if (currentPage > 4 && currentPage < totalPages - 1) {
				pagesList.push('...');
				pagesList.push(currentPage);
			}
			pagesList.push('...');
			pagesList.push(totalPages);
		}
		return pagesList.map((page, index) => {
			if (page === '...') {
				return (
					<div key={`ellipse-${index}`} className='flex items-center px-1'>
						<span className='dark:text-zinc-550 text-xs font-bold text-slate-400 select-none'>
							•••
						</span>
					</div>
				);
			}
			const isPageActive = currentPage === page;
			return (
				<button
					key={`page-${page}`}
					onClick={() => setCurrentPage(page as number)}
					className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xs font-extrabold transition-all duration-200 ${
						isPageActive
							? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500'
							: 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
					}`}>
					{page}
				</button>
			);
		});
	};

	return (
		<Container className='relative overflow-x-hidden overflow-y-auto bg-[#f8f9fc] !p-0 dark:bg-zinc-950'>
			{/* Premium background decorative mesh glows */}
			<div className='pointer-events-none absolute top-[-10%] right-[-10%] -z-10 h-[45%] w-[45%] rounded-full bg-gradient-to-tr from-violet-500/5 to-indigo-500/5 blur-[120px]' />
			<div className='pointer-events-none absolute bottom-[-10%] left-[-10%] -z-10 h-[45%] w-[45%] rounded-full bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 blur-[120px]' />

			<div className='mx-auto flex w-full max-w-7xl flex-col space-y-6 p-4 sm:p-6 md:p-8'>
				{/* Title Row with Clock Icon */}
				<div className='flex items-center gap-4.5'>
					{/* Mobile Toggle Aside Menu Button */}
					<button
						onClick={toggleAside}
						type='button'
						className='flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm md:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
					>
						<Menu size={18} />
					</button>

					<div className='hidden md:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eedeff]/60 text-[#8b5cf6] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] dark:bg-violet-950/40 dark:text-[#a78bfa]'>
						<Clock className='h-6 w-6' strokeWidth={2.2} />
					</div>
					<div className='flex flex-col gap-0.5 text-left'>
						<h1 className='text-2xl font-black tracking-tight text-slate-900 dark:text-white'>
							History
						</h1>
						<p className='dark:text-zinc-450 text-xs font-semibold text-slate-500'>
							View your agent chats and workflow runs
						</p>
					</div>
				</div>

				{/* Search & Filter Controls Grid */}
				<div className='flex flex-col gap-3.5 md:flex-row md:items-center'>
					<div className='group relative flex-1'>
						<Search className='absolute top-3.5 left-4 h-4.5 w-4.5 text-slate-400 transition-colors duration-200 group-focus-within:text-violet-500' />
						<input
							type='search'
							aria-label='Search history'
							placeholder='Search by title, run type, or date...'
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setCurrentPage(1);
							}}
							className='dark:placeholder:text-zinc-650 block h-12 w-full rounded-2xl border border-slate-200 bg-white/55 pr-4 pl-12 text-xs font-semibold text-slate-900 shadow-xs transition-all duration-200 outline-none placeholder:text-slate-400 focus:border-violet-500/80 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:bg-zinc-950/60 dark:focus:ring-violet-500/15'
						/>
					</div>

					{/* Filters controls */}
					<div className='flex items-center justify-end gap-2.5'>
						<div className='relative'>
							<button
								onClick={() => setShowFilters(!showFilters)}
								className='dark:text-zinc-350 dark:hover:bg-zinc-800 flex h-12 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/60'>
								<Filter size={14} className='text-slate-400' />
								<span>Filters</span>
							</button>

							<AnimatePresence>
								{showFilters && (
									<motion.div
										initial={{ opacity: 0, y: 8, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 8, scale: 0.95 }}
										className='absolute right-0 z-40 mt-2 w-48 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-[#11131c]/95'>
										<div className='dark:text-zinc-550 mb-1 border-b border-slate-100 px-2.5 py-1.5 text-[9px] font-black tracking-wider text-slate-400 uppercase dark:border-zinc-800/60'>
											Filter Type
										</div>
										{(['All', 'Chat', 'Workflow run'] as const).map((type) => (
											<button
												key={type}
												onClick={() => {
													setSelectedType(type);
													setShowFilters(false);
													setCurrentPage(1);
												}}
												className={`w-full cursor-pointer rounded-xl px-2.5 py-2 text-left text-xs font-bold transition ${
													selectedType === type
														? 'text-violet-650 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400'
														: 'text-slate-650 dark:text-zinc-350 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
												}`}>
												{type === 'All' ? 'All Activities' : type}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						<button
							onClick={() => {
								setSelectedType('All');
								setCurrentPage(1);
							}}
							className={`flex h-12 cursor-pointer items-center justify-center rounded-2xl px-5 text-xs font-black transition-all duration-300 ${
								selectedType === 'All'
									? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25 dark:shadow-none'
									: 'dark:text-zinc-350 dark:hover:bg-zinc-800 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/60'
							}`}>
							All
						</button>
					</div>
				</div>

				{/* Statistics Cards Section */}
				<div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
					{/* Card 1: Total Runs */}
					<div className='group relative flex items-center justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#11131c]'>
						<div className='flex flex-col gap-1 text-left'>
							<span className='text-[10px] font-black tracking-widest text-violet-600 uppercase dark:text-violet-400'>
								Total Runs
							</span>
							<span className='text-3.5xl font-black tracking-tight text-slate-900 dark:text-white'>
								128
							</span>
						</div>
						{/* SVG sparkline chart */}
						<div className='h-12 w-24 text-violet-500 drop-shadow-[0_2px_4px_rgba(139,92,246,0.15)]'>
							<svg viewBox='0 0 100 40' className='h-full w-full overflow-visible'>
								<defs>
									<linearGradient id='violet-glow' x1='0' y1='0' x2='0' y2='1'>
										<stop offset='0%' stopColor='rgb(139, 92, 246)' stopOpacity='0.15' />
										<stop offset='100%' stopColor='rgb(139, 92, 246)' stopOpacity='0.0' />
									</linearGradient>
								</defs>
								<path
									d='M 0,30 Q 15,35 30,20 T 60,10 T 80,25 T 100,5'
									fill='url(#violet-glow)'
									className='transition-all duration-300'
								/>
								<path
									d='M 0,30 Q 15,35 30,20 T 60,10 T 80,25 T 100,5'
									fill='none'
									stroke='currentColor'
									strokeWidth='2.8'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
					</div>

					{/* Card 2: Chats */}
					<div className='group relative flex items-center justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#11131c]'>
						<div className='flex flex-col gap-1 text-left'>
							<span className='text-[10px] font-black tracking-widest text-violet-600 uppercase dark:text-violet-400'>
								Chats
							</span>
							<span className='text-3.5xl font-black tracking-tight text-slate-900 dark:text-white'>
								82
							</span>
						</div>
						<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-inner transition-transform duration-300 group-hover:scale-105 dark:bg-violet-950/30 dark:text-violet-400'>
							<MessageSquare className='h-5 w-5' />
						</div>
					</div>

					{/* Card 3: Workflow Runs */}
					<div className='group relative flex items-center justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#11131c]'>
						<div className='flex flex-col gap-1 text-left'>
							<span className='text-[10px] font-black tracking-widest text-violet-600 uppercase dark:text-violet-400'>
								Workflow Runs
							</span>
							<span className='text-3.5xl font-black tracking-tight text-slate-900 dark:text-white'>
								46
							</span>
						</div>
						<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner transition-transform duration-300 group-hover:scale-105 dark:bg-emerald-950/30 dark:text-emerald-400'>
							<Workflow className='h-5 w-5' />
						</div>
					</div>

					{/* Card 4: Success Rate */}
					<div className='group relative flex items-center justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-350 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#11131c]'>
						<div className='flex flex-col gap-1 text-left'>
							<span className='text-[10px] font-black tracking-widest text-violet-600 uppercase dark:text-violet-400'>
								Success Rate
							</span>
							<span className='text-3.5xl font-black tracking-tight text-slate-900 dark:text-white'>
								98.2%
							</span>
						</div>
						{/* SVG sparkline chart */}
						<div className='h-12 w-24 text-[#3b82f6] drop-shadow-[0_2px_4px_rgba(59,130,246,0.15)]'>
							<svg viewBox='0 0 100 40' className='h-full w-full overflow-visible'>
								<defs>
									<linearGradient id='blue-glow' x1='0' y1='0' x2='0' y2='1'>
										<stop offset='0%' stopColor='rgb(59, 130, 246)' stopOpacity='0.15' />
										<stop offset='100%' stopColor='rgb(59, 130, 246)' stopOpacity='0.0' />
									</linearGradient>
								</defs>
								<path
									d='M 0,35 Q 20,20 40,30 T 70,10 T 100,8'
									fill='url(#blue-glow)'
									className='transition-all duration-300'
								/>
								<path
									d='M 0,35 Q 20,20 40,30 T 70,10 T 100,8'
									fill='none'
									stroke='currentColor'
									strokeWidth='2.8'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* History Items list/table */}
				<div className='overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:shadow-none'>
					{isLoading ? (
						<div className='animate-pulse divide-y divide-slate-100 dark:divide-zinc-800/60'>
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className='flex items-center justify-between gap-4 p-5'>
									<div className='flex min-w-0 flex-1 items-center gap-4'>
										<div className='h-11 w-11 shrink-0 rounded-2xl bg-slate-200 dark:bg-zinc-800' />
										<div className='max-w-sm flex-1 space-y-2'>
											<div className='h-4 w-2/3 rounded bg-slate-200 dark:bg-zinc-800' />
											<div className='h-3 w-1/4 rounded bg-slate-200 dark:bg-zinc-800' />
										</div>
									</div>
									<div className='flex items-center gap-8'>
										<div className='h-6 w-16 rounded bg-slate-200 dark:bg-zinc-800' />
										<div className='h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800' />
									</div>
								</div>
							))}
						</div>
					) : paginatedItems.length === 0 ? (
						<div className='flex flex-col items-center justify-center space-y-3.5 p-16 text-center'>
							<div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/50 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950'>
								<Search className='h-5 w-5 text-slate-400' />
							</div>
							<div>
								<p className='text-sm font-black text-slate-800 dark:text-zinc-200'>
									No history results found
								</p>
								<p className='mt-1 text-xs text-slate-400'>
									Try refining your search keyword or selecting a different filter
									type.
								</p>
							</div>
						</div>
					) : (
						<div className='no-scrollbar flex flex-col'>
							{/* Desktop View Table */}
							<div className='hidden md:block no-scrollbar overflow-x-auto'>
								<div className='min-w-[768px]'>
									{/* Table Header */}
									<div className='grid grid-cols-12 gap-4 border-b border-slate-100 bg-[#fafbfe]/70 px-6 py-4.5 text-left text-[11px] font-black tracking-wider text-slate-400 uppercase dark:border-zinc-800/80 dark:bg-zinc-950/20'>
										<div className='col-span-5'>Activity</div>
										<div className='col-span-2'>Type</div>
										<div className='col-span-2'>Connections</div>
										<div className='col-span-2'>Date & Time</div>
										<div className='col-span-1'></div>
									</div>

									{/* Table Body */}
									<div className='divide-y divide-slate-100 dark:divide-zinc-800/60'>
										{paginatedItems.map((item) => {
											const isMock = 'timestamp' in item;
											let displayItem;

											if (isMock) {
												const mock = item as IHistoryItem;
												displayItem = {
													id: mock.id,
													title: mock.title,
													type: mock.type,
													timestamp: mock.timestamp,
													credits: mock.credits,
													status: mock.status,
													icon: mock.icon,
												};
											} else {
												const real = item as TExecution;
												const isAgent = real.type === 'agent';

												let displayStatus = 'Pending';
												if (real.status === 'completed')
													displayStatus = 'Complete';
												else if (real.status === 'failed')
													displayStatus = 'Failed';
												else if (real.status === 'cancelled')
													displayStatus = 'Cancelled';
												else if (real.status) {
													displayStatus =
														real.status.charAt(0).toUpperCase() +
														real.status.slice(1);
												}

												displayItem = {
													id: real.id,
													title: isAgent
														? real.agent_name || 'Agent Run'
														: real.workflow_name || 'Workflow Run',
													type: isAgent ? 'Chat' : 'Workflow run',
													timestamp: real.started_at
														? dayjs(real.started_at).format(
																'MMM D, YYYY • h:mm A',
															)
														: 'Pending',
													credits: real.credits_consumed ?? 0,
													status: displayStatus,
													icon: isAgent ? Bot : Workflow,
												};
											}

											const IconComponent = displayItem.icon;
											const isSelected = selectedItem?.id === displayItem.id;
											return (
												<div
													key={displayItem.id}
													onClick={() => setSelectedItem(item)}
													className={`grid cursor-pointer grid-cols-12 items-center gap-4 px-6 py-4.5 transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 ${
														isSelected
															? 'border-l-4 border-violet-500 bg-violet-500/[0.02] dark:bg-violet-500/[0.02]'
															: ''
													}`}>
													{/* Activity col */}
													<div className='col-span-5 flex min-w-0 items-center gap-4'>
														<div
															className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
																displayItem.type === 'Chat'
																	? 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400'
																	: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
															}`}>
															<IconComponent className='h-5.5 w-5.5' />
														</div>
														<div className='flex min-w-0 flex-col items-start'>
															<span className='w-full truncate text-[14px] font-black text-slate-850 dark:text-white leading-tight mb-0.5'>
																{displayItem.title}
															</span>
															<span className='dark:text-zinc-550 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider'>
																{displayItem.type === 'Chat'
																	? 'Chat Activity'
																	: 'Workflow Run'}
															</span>
														</div>
													</div>

													{/* Type tag col */}
													<div className='col-span-2 flex justify-start'>
														<span
															className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black tracking-widest ${
																displayItem.type === 'Chat'
																	? 'border border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-900/30 dark:bg-purple-950/30 dark:text-purple-400'
																	: 'border border-blue-100 bg-blue-55 bg-blue-50 text-blue-600 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400'
															}`}>
															{displayItem.type === 'Chat'
																? 'CHAT'
																: 'WORKFLOW'}
														</span>
													</div>

													{/* Connections col */}
													<div className='text-slate-655 col-span-2 flex items-center justify-start gap-1.5 text-xs font-bold dark:text-zinc-400'>
														<div className='flex h-7 items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 px-2 dark:border-zinc-800 dark:bg-zinc-950/40'>
															<Link2
																size={12}
																className='shrink-0 text-emerald-500'
															/>
															<span className='dark:text-zinc-250 font-black text-slate-750'>
																{displayItem.credits} cr
															</span>
														</div>
													</div>

													{/* Date Time col */}
													<div className='col-span-2 flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500 dark:text-zinc-400'>
														<Calendar
															size={12.5}
															className='shrink-0 text-slate-400'
														/>
														<span>{displayItem.timestamp}</span>
													</div>

													{/* Action button col */}
													<div className='col-span-1 flex justify-end'>
														<button
															type='button'
															aria-label='More actions'
															onClick={(e) => {
																e.stopPropagation();
															}}
															className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-750 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'>
															<MoreVertical size={16} />
														</button>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>

							{/* Mobile View Card List */}
							<div className='block md:hidden divide-y divide-slate-100 dark:divide-zinc-800/60'>
								{paginatedItems.map((item) => {
									const isMock = 'timestamp' in item;
									let displayItem;

									if (isMock) {
										const mock = item as IHistoryItem;
										displayItem = {
											id: mock.id,
											title: mock.title,
											type: mock.type,
											timestamp: mock.timestamp,
											credits: mock.credits,
											status: mock.status,
											icon: mock.icon,
										};
									} else {
										const real = item as TExecution;
										const isAgent = real.type === 'agent';

										let displayStatus = 'Pending';
										if (real.status === 'completed')
											displayStatus = 'Complete';
										else if (real.status === 'failed')
											displayStatus = 'Failed';
										else if (real.status === 'cancelled')
											displayStatus = 'Cancelled';
										else if (real.status) {
											displayStatus =
												real.status.charAt(0).toUpperCase() +
												real.status.slice(1);
										}

										displayItem = {
											id: real.id,
											title: isAgent
												? real.agent_name || 'Agent Run'
												: real.workflow_name || 'Workflow Run',
											type: isAgent ? 'Chat' : 'Workflow run',
											timestamp: real.started_at
												? dayjs(real.started_at).format(
														'MMM D, YYYY • h:mm A',
													)
												: 'Pending',
											credits: real.credits_consumed ?? 0,
											status: displayStatus,
											icon: isAgent ? Bot : Workflow,
										};
									}

									const IconComponent = displayItem.icon;
									const isSelected = selectedItem?.id === displayItem.id;
									return (
										<div
											key={displayItem.id}
											onClick={() => setSelectedItem(item)}
											className={`flex items-start justify-between gap-3 p-5 transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 ${
												isSelected
													? 'border-l-4 border-violet-500 bg-violet-500/[0.02] dark:bg-violet-500/[0.02]'
													: ''
											}`}
										>
											<div className='flex items-start gap-3.5 min-w-0 flex-1 text-left'>
												{/* Icon */}
												<div
													className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
														displayItem.type === 'Chat'
															? 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400'
															: 'bg-[#eff6ff] text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
													}`}
												>
													<IconComponent className='h-5.5 w-5.5' />
												</div>
												
												{/* Text Info */}
												<div className='flex min-w-0 flex-1 flex-col text-left'>
													<span className='truncate text-[14px] font-black text-slate-850 dark:text-white leading-tight mb-1.5'>
														{displayItem.title}
													</span>
													
													{/* Meta details row */}
													<div className='flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-0.5'>
														<span
															className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[8.5px] font-black tracking-widest ${
																displayItem.type === 'Chat'
																	? 'bg-purple-50 text-purple-650 border border-purple-100 dark:border-purple-900/30 dark:bg-purple-950/30 dark:text-purple-400'
																	: 'bg-[#eff6ff] text-[#3b82f6] border border-blue-100 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400'
															}`}
														>
															{displayItem.type === 'Chat' ? 'CHAT' : 'WORKFLOW'}
														</span>
														
														<span className='text-[10px] font-bold text-slate-400 dark:text-zinc-500 flex items-center gap-1'>
															<Link2 size={10} className='text-emerald-500' />
															<span className='font-black text-slate-700 dark:text-zinc-250'>{displayItem.credits} cr</span>
														</span>

														<span className='text-[10px] font-semibold text-slate-450 dark:text-zinc-500'>
															{displayItem.timestamp}
														</span>
													</div>
												</div>
											</div>
											
											{/* Right: Status and Chevron */}
											<div className='flex flex-col items-end shrink-0 gap-3'>
												<span
													className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wide ${
														displayItem.status === 'Complete'
															? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/10 dark:bg-emerald-500/5 dark:text-emerald-400'
															: displayItem.status === 'Failed'
																? 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-500/10 dark:bg-rose-500/5 dark:text-rose-400'
																: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:border-zinc-500/10 dark:bg-zinc-500/5 dark:text-zinc-400'
													}`}
												>
													{displayItem.status}
												</span>
												<ChevronRight size={15} className='text-slate-400 dark:text-zinc-500' />
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Pagination Controls footer - only show if more than one page or more items than can fit on one page */}
					{totalPages > 1 && (
					<div className='flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-[#fafbfe]/70 px-6 py-4 sm:flex-row dark:border-zinc-800/80 dark:bg-zinc-950/20'>
						<div className='dark:text-zinc-450 flex items-center gap-2 text-xs font-bold text-slate-500'>
							<span>
								Showing {itemStart} to {itemEnd} of {totalItems} results
							</span>
						</div>

						{/* Center: Pagination numbers */}
						<div className='flex items-center gap-1.5'>
							<button
								disabled={currentPage === 1}
								onClick={() => setCurrentPage(currentPage - 1)}
								className='text-slate-550 dark:hover:bg-zinc-800 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'>
								<ChevronLeft size={15} />
							</button>
							{renderPageNumbers()}
							<button
								disabled={currentPage === totalPages}
								onClick={() => setCurrentPage(currentPage + 1)}
								className='text-slate-550 dark:hover:bg-zinc-800 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white shadow-xs transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'>
								<ChevronRight size={15} />
							</button>
						</div>

						{/* Right: rows dropdown */}
						<div className='dark:text-zinc-450 flex items-center gap-2 text-xs font-bold text-slate-500'>
							<div className='relative'>
								<select
									value={rowsPerPage}
									onChange={(e) => {
										setRowsPerPage(Number(e.target.value));
										setCurrentPage(1);
									}}
									style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
									className='h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white bg-[url("/src/assets/required/chevron-down.svg")] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8 pl-3.5 text-xs font-bold shadow-xs transition-colors outline-none focus:border-violet-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'>
									{[10, 20, 50].map((val) => (
										<option key={val} value={val}>
											{val} per page
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
					)}
				</div>
			</div>

			{/* Slide-out details drawer panel overlay */}
			<AnimatePresence>
				{selectedItem && selectedDetails && (
					<>
						{/* Backdrop dimmer */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.3 }}
							exit={{ opacity: 0 }}
							className='fixed inset-0 z-40 bg-black'
							onClick={() => setSelectedItem(null)}
						/>

						{/* Drawer panel content */}
						<motion.div
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: 'spring' as const, stiffness: 260, damping: 28 }}
							className='dark:border-zinc-800 fixed top-0 right-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white font-sans shadow-2xl dark:bg-[#0f111a]'>
							<div className='flex items-center justify-between border-b border-slate-100 p-6 dark:border-zinc-800/80'>
								<div className='flex items-center gap-3'>
									<div className='flex h-9 w-9 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600 dark:border-violet-900/30 dark:bg-violet-950/20 dark:text-violet-400'>
										<Activity size={17} />
									</div>
									<h2 className='text-lg font-black text-slate-900 dark:text-white'>
										{selectedDetails.type} Details
									</h2>
								</div>
								<button
									onClick={() => setSelectedItem(null)}
									className='hover:text-slate-655 dark:hover:bg-zinc-800 cursor-pointer rounded-xl p-2 text-slate-400 transition hover:bg-slate-100'>
									<X size={18} />
								</button>
							</div>

							<div className='no-scrollbar flex-1 space-y-6 overflow-y-auto p-6'>
								<div className='space-y-4'>
									<h3 className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>
										Summary
									</h3>

									<div className='grid grid-cols-3 gap-3'>
										<div className='dark:border-zinc-800 rounded-2xl border border-slate-200/50 bg-slate-50 p-3.5 text-left dark:bg-zinc-950/30'>
											<span className='mb-1 block text-[9px] font-black tracking-wider text-slate-400 uppercase'>
												Source
											</span>
											<span className='flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-zinc-200'>
												<MessageSquare
													size={13}
													className='text-indigo-500'
												/>
												{selectedDetails.type}
											</span>
										</div>
										<div className='dark:border-zinc-800 rounded-2xl border border-slate-200/50 bg-slate-50 p-3.5 text-left dark:bg-zinc-950/30'>
											<span className='mb-1 block text-[9px] font-black tracking-wider text-slate-400 uppercase'>
												Started
											</span>
											<span className='flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-zinc-200'>
												<Clock size={13} className='text-emerald-500' />
												{selectedDetails.timestamp.split('•')[0].trim()}
											</span>
										</div>
										<div className='dark:border-zinc-800 rounded-2xl border border-slate-200/50 bg-slate-50 p-3.5 text-left dark:bg-zinc-950/30'>
											<span className='mb-1 block text-[9px] font-black tracking-wider text-slate-400 uppercase'>
												Credits
											</span>
											<span className='flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-zinc-200'>
												<Coins size={13} className='text-amber-500' />
												{selectedDetails.credits} Creds
											</span>
										</div>
									</div>
								</div>

								{selectedDetails.chatTranscript ? (
									<div className='space-y-4'>
										<h3 className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>
											Activity Logs
										</h3>

										<div className='border-slate-150 dark:border-zinc-800 space-y-4 rounded-2xl border bg-slate-50/50 p-4.5 dark:bg-zinc-950/20'>
											{selectedDetails.chatTranscript.map((log, idx) => (
												<div
													key={idx}
													className={`flex flex-col gap-1.5 ${
														log.sender === 'user'
															? 'items-end'
															: 'items-start'
													}`}>
													<span className='text-[9px] font-black tracking-wider text-slate-400 uppercase'>
														{log.sender === 'user'
															? 'User Input'
															: 'Agent Response'}
													</span>
													<div
														className={`max-w-[85%] rounded-2xl border p-3 text-xs leading-relaxed font-semibold shadow-xs ${
															log.sender === 'user'
																? 'bg-violet-650 border-violet-750 rounded-tr-none text-white'
																: 'text-slate-850 rounded-tl-none border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
														}`}>
														{log.text}
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className='space-y-4'>
										<h3 className='text-[10px] font-black tracking-widest text-slate-400 uppercase'>
											Activity Logs
										</h3>
										<ExecutionLogsViewer
											ws={activeWorkspaceId}
											executionId={selectedDetails.id}
										/>
									</div>
								)}
							</div>

							<div className='flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-6 dark:border-zinc-800/80 dark:bg-zinc-950/40'>
								<button
									onClick={() => handleCopyUrl(selectedDetails.id)}
									className='dark:hover:bg-zinc-800 flex h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4.5 text-xs font-black text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'>
									{copied ? (
										<Check size={14} className='text-emerald-500' />
									) : (
										<Copy size={14} />
									)}
									<span>{copied ? 'Copied URL!' : 'Copy URL'}</span>
								</button>
								<button
									onClick={() => {
										setSelectedItem(null);
									}}
									className='flex h-11 cursor-pointer items-center gap-1.5 rounded-xl bg-slate-950 px-5 text-xs font-black text-white shadow-md transition active:scale-95 dark:bg-zinc-100 dark:text-slate-950'>
									<span>Close View</span>
									<ExternalLink size={14} />
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</Container>
	);
};

export default HistoryListPage;
