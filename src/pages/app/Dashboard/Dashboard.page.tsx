import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
	GitMerge,
	Bot,
	LayoutGrid,
	Activity,
	Play,
	Clock,
	Zap,
	ArrowRight,
	Check,
	Circle,
	X,
	MoreVertical,
	Mail,
	User,
	Crown,
	ChevronRight,
	Plus,
	FileText,
} from 'lucide-react';
import { OutletContextType } from '@/pages/app/Dashboard/_layouts/Dashboard.layout';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Container from '@/components/layout/Container';
import pages from '@/Routes/pages';
import { useAuth } from '@/context/authContext';
import type { TOnboardingStepKey, TOnboardingState } from '@/types/auth.type';
import { useWorkspaceContext } from '@/context/workspaceContext';

const DEFAULT_ONBOARDING: TOnboardingState = {
	is_complete: false,
	is_dismissed: false,
	progress: 4,
	total: 6,
	steps: [
		{
			key: 'verify_email',
			label: 'Verify your email',
			description: 'Confirm your email address to secure your account.',
			done: false,
		},
		{
			key: 'complete_profile',
			label: 'Complete your profile',
			description: 'Add a profile photo so your teammates can recognize you.',
			done: false,
		},
		{
			key: 'create_workspace',
			label: 'Create a workspace',
			description: 'Set up a workspace to organize your workflows.',
			done: true,
		},
		{
			key: 'add_credential',
			label: 'Add a credential',
			description: 'Connect an external service to use in your automation.',
			done: true,
		},
		{
			key: 'create_workflow',
			label: 'Create your first workflow',
			description: 'Build your first automation workflow.',
			done: true,
		},
		{
			key: 'activate_workflow',
			label: 'Activate a workflow',
			description: 'Turn on a workflow and let it run automatically.',
			done: true,
		},
	],
};

const stats = [
	{
		label: 'Total Workflows',
		value: '8',
		sub: '4 currently active',
		icon: GitMerge,
		iconBg: 'bg-violet-500/5 border-violet-500/15 text-violet-650 dark:bg-violet-500/10 dark:text-violet-400',
		sparkPath: 'M 0 22 Q 15 8 30 18 T 60 5 T 90 12 T 100 8',
		sparkColor: '#7c3aed',
		glowClass:
			'hover:border-violet-500/40 hover:shadow-[0_8px_30px_rgba(124,58,237,0.08)] dark:hover:border-violet-500/30',
		endX: 100,
		endY: 8,
	},
	{
		label: 'Active Agents',
		value: '3',
		sub: 'Running autonomously',
		icon: Bot,
		iconBg: 'bg-blue-500/5 border-blue-500/15 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
		sparkPath: 'M 0 10 Q 20 22 40 10 T 70 18 T 90 5 T 100 8',
		sparkColor: '#2563eb',
		glowClass:
			'hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] dark:hover:border-blue-500/30',
		endX: 100,
		endY: 8,
	},
	{
		label: 'Connected Apps',
		value: '8',
		sub: 'OAuth credentials active',
		icon: LayoutGrid,
		iconBg: 'bg-amber-500/5 border-amber-500/15 text-amber-600 dark:bg-amber-500/10 dark:text-amber-505',
		sparkPath: 'M 0 20 Q 20 8 40 22 T 70 8 T 95 18 T 100 15',
		sparkColor: '#d97706',
		glowClass:
			'hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(217,119,6,0.08)] dark:hover:border-amber-500/30',
		endX: 100,
		endY: 15,
	},
	{
		label: 'Runs (Last 24h)',
		value: '1,280',
		sub: '14% spike today',
		icon: Activity,
		iconBg: 'bg-teal-500/5 border-teal-500/15 text-teal-600 dark:bg-teal-500/10 dark:text-teal-450',
		sparkPath: 'M 0 28 Q 15 15 35 25 T 65 10 T 90 4 T 100 2',
		sparkColor: '#0d9488',
		glowClass:
			'hover:border-teal-500/40 hover:shadow-[0_8px_30px_rgba(13,148,136,0.08)] dark:hover:border-teal-500/30',
		endX: 100,
		endY: 2,
	},
];

const recentWorkflows = [
	{
		id: '1',
		title: 'Lead enrichment pipeline',
		status: 'active',
		lastRun: '12 mins ago',
		successRate: 98.4,
	},
	{
		id: '2',
		title: 'Email campaign automation',
		status: 'active',
		lastRun: '2 hours ago',
		successRate: 99.1,
	},
	{
		id: '3',
		title: 'Support ticket triage',
		status: 'active',
		lastRun: '5 hours ago',
		successRate: 97.6,
	},
	{
		id: '4',
		title: 'Weekly analytics report',
		status: 'inactive',
		lastRun: '1 day ago',
		successRate: 100.0,
	},
];

const quickActions = [
	{
		label: 'Create Workflow',
		icon: Plus,
		description: 'Build a new automation',
		color: 'border-violet-500/20 bg-white/70 hover:border-violet-500/50 hover:bg-violet-500/5 dark:border-zinc-800 dark:bg-[#11131c]/60 dark:hover:border-violet-500/30',
		hoverText: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
		iconStyle: 'bg-violet-500/10 text-violet-650 dark:bg-violet-500/20 dark:text-violet-400',
	},
	{
		label: 'Add Agent',
		icon: Bot,
		description: 'Deploy a new AI agent',
		color: 'border-blue-500/20 bg-white/70 hover:border-blue-500/50 hover:bg-blue-500/5 dark:border-zinc-800 dark:bg-[#11131c]/60 dark:hover:border-blue-500/30',
		hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
		iconStyle: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
	},
	{
		label: 'Connect App',
		icon: LayoutGrid,
		description: 'Integrate a new application',
		color: 'border-amber-500/20 bg-white/70 hover:border-amber-500/50 hover:bg-amber-500/5 dark:border-zinc-800 dark:bg-[#11131c]/60 dark:hover:border-amber-500/30',
		hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
		iconStyle: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500',
	},
	{
		label: 'Browse Templates',
		icon: FileText,
		description: 'Explore pre-built workflows',
		color: 'border-emerald-500/20 bg-white/70 hover:border-emerald-500/50 hover:bg-emerald-500/5 dark:border-zinc-800 dark:bg-[#11131c]/60 dark:hover:border-emerald-500/30',
		hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
		iconStyle:
			'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
	},
];

const onboardingIcons: Record<TOnboardingStepKey, React.ComponentType<{ size?: number }>> = {
	verify_email: Mail,
	complete_profile: User,
	create_workspace: Bot,
	add_credential: GitMerge,
	create_workflow: GitMerge,
	activate_workflow: Zap,
};

const DashboardPage = () => {
	const { setHeaderLeft } = useOutletContext<OutletContextType>();
	const navigate = useNavigate();
	const { userData } = useAuth();
	const { workspaces: apiWorkspaces, activeWorkspaceId } = useWorkspaceContext();

	const [onboarding, setOnboarding] = useState<TOnboardingState>(DEFAULT_ONBOARDING);

	const handleOnboardingAction = (key: TOnboardingStepKey) => {
		switch (key) {
			case 'verify_email':
				navigate('/verify-email');
				break;
			case 'complete_profile':
				navigate('/onboarding');
				break;
			case 'create_workspace':
				navigate('/onboarding/create-workspace');
				break;
			case 'add_credential':
				navigate('/apps?connect=true');
				break;
			case 'create_workflow':
				navigate('/workflows?create=true');
				break;
			case 'activate_workflow':
				navigate('/workflows');
				break;
		}
	};

	const nextOnboardingStep = onboarding.steps.find((item) => !item.done);

	const colorList = [
		'bg-indigo-600',
		'bg-emerald-600',
		'bg-fuchsia-600',
		'bg-amber-600',
		'bg-rose-500',
		'bg-blue-600',
	];
	const workspaces = apiWorkspaces.map((ws, index) => ({
		...ws,
		color: colorList[index % colorList.length],
	}));
	const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
	const userName =
		(userData?.firstName === 'Dev' ? 'Sahil' : userData?.firstName) ||
		'Sahil';

	useEffect(() => {
		setHeaderLeft(<Breadcrumb list={[{ ...pages.app.subPages.dashboard }]} />);
		return () => setHeaderLeft(undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Container className='relative overflow-x-hidden overflow-y-auto !bg-[#fafbfe] !px-0 !pt-0 font-sans dark:!bg-[#070911]'>
			{/* Grid Background Pattern */}
			<div className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-70 dark:bg-[radial-gradient(#161c2c_1.5px,transparent_1.5px)] dark:opacity-85' />

			<div className='pointer-events-none absolute top-0 right-10 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-violet-500/8 to-blue-500/8 blur-[120px]' />
			<div className='pointer-events-none absolute bottom-10 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-pink-500/4 to-cyan-500/4 blur-[100px]' />

			<div className='mx-auto w-full max-w-7xl space-y-6 p-6 md:p-8'>
				{/* Welcome Banner */}
				<motion.div
					initial={{ opacity: 0, y: -15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className='dark:border-zinc-800 relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-r from-[#090b1a] via-[#111438] to-[#250d4f] p-6 shadow-xl shadow-indigo-950/20 md:p-8 dark:from-[#05060f] dark:via-[#0c0d24] dark:to-[#170932]'>
					{/* Grid Overlay inside Banner */}
					<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:16px_16px] opacity-60' />

					<div className='relative flex flex-col justify-between gap-6 md:flex-row md:items-center'>
						<div className='flex-1 space-y-4'>
							<h1 className='flex flex-wrap items-center gap-2 text-2xl font-black tracking-tight text-white md:text-3xl'>
								Welcome back,{' '}
								<span className='bg-gradient-to-r from-violet-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent'>
									{userName}
								</span>
								<motion.span
									className='inline-block origin-[70%_70%] cursor-default text-2xl select-none md:text-3xl'
									animate={{
										rotate: [0, 14, -8, 14, -4, 10, 0],
									}}
									transition={{
										duration: 2.5,
										ease: 'easeInOut',
										repeat: Infinity,
										repeatDelay: 3,
									}}
									whileHover={{
										rotate: [0, 20, -10, 20, -10, 0],
										transition: { duration: 0.6 },
									}}>
									👋
								</motion.span>
							</h1>

							<p className='max-w-xl text-xs leading-relaxed font-semibold text-zinc-300 md:text-sm'>
								You have{' '}
								<span className='font-bold text-white'>3 active agents</span>{' '}
								running autonomously across{' '}
								<span className='font-bold text-white'>8 workflows.</span>
							</p>

							{/* Meta Info Badges */}
							<div className='flex flex-wrap items-center gap-2.5 pt-1'>
								{/* Active Workspace */}
								<div className='flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-[11px] font-bold text-white/95 shadow-xs'>
									<span className='text-[10px] font-extrabold tracking-wider text-zinc-400 uppercase'>
										WORKSPACE
									</span>
									<span className='text-zinc-600'>|</span>
									{activeWorkspace?.color && (
										<div
											className={`h-2 w-2 rounded-full ${activeWorkspace.color} ring-2 ring-white/10`}
										/>
									)}
									<span className='font-bold'>
										{activeWorkspace?.name || 'Amaan Studio'}
									</span>
								</div>

								{/* Plan Badge */}
								<div className='flex items-center gap-1 rounded-full border border-violet-500/30 bg-[#261546]/85 px-3 py-1 text-[11px] font-bold text-violet-200'>
									<Crown size={11} className='text-violet-400' />
									<span>Pro Account</span>
								</div>

								{/* Status Badge */}
								<div className='flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[#0e2a27]/85 px-3 py-1 text-[11px] font-bold text-emerald-300'>
									<span className='relative flex h-1.5 w-1.5'>
										<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
										<span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500'></span>
									</span>
									<span>Systems Nominal</span>
								</div>
							</div>
						</div>

						{/* Center-Right: Floating Cards Illustration */}
						<div className='relative mr-4 hidden h-28 w-60 items-center justify-center select-none lg:flex'>
							{/* Left Floating Badge (Purple Lightning) */}
							<motion.div
								initial={{ y: 5, rotate: 12 }}
								animate={{ y: [-4, 4, -4] }}
								transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
								className='absolute top-0 left-2 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
								style={{
									transform: 'perspective(800px) rotateY(-20deg) rotateX(15deg)',
								}}>
								<Zap size={14} fill='currentColor' />
							</motion.div>

							{/* Main Analytics Card */}
							<div
								className='relative z-10 flex h-24 w-44 flex-col justify-between rounded-2xl border border-white/20 bg-white/95 p-3 shadow-2xl shadow-indigo-950/40 dark:bg-zinc-900/90'
								style={{
									transform:
										'perspective(800px) rotateY(-20deg) rotateX(15deg) rotateZ(-2deg)',
								}}>
								<div className='flex items-center justify-between'>
									<div className='flex gap-1'>
										<div className='h-1.5 w-6 rounded-full bg-violet-200 dark:bg-violet-900' />
										<div className='h-1.5 w-3 rounded-full bg-slate-200 dark:bg-zinc-800' />
									</div>
									<div className='dark:bg-zinc-800 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-100'>
										<div className='h-1 w-1 rounded-full bg-slate-400' />
									</div>
								</div>
								{/* SVG Line chart inside */}
								<div className='mt-2 flex-1'>
									<svg
										className='h-10 w-full overflow-visible'
										viewBox='0 0 100 30'
										preserveAspectRatio='none'>
										<defs>
											<linearGradient
												id='purple-glow-banner'
												x1='0'
												y1='0'
												x2='0'
												y2='1'>
												<stop
													offset='0%'
													stopColor='#8b5cf6'
													stopOpacity='0.4'
												/>
												<stop
													offset='100%'
													stopColor='#8b5cf6'
													stopOpacity='0.0'
												/>
											</linearGradient>
										</defs>
										<path
											d='M0,25 Q15,5 35,18 T75,8 T100,5'
											fill='none'
											stroke='#8b5cf6'
											strokeWidth='2.5'
											strokeLinecap='round'
										/>
										<path
											d='M0,25 Q15,5 35,18 T75,8 T100,5 L100,30 L0,30 Z'
											fill='url(#purple-glow-banner)'
										/>
										<circle cx='100' cy='5' r='2.5' fill='#8b5cf6' />
									</svg>
								</div>
							</div>

							{/* Right Floating Badge (Green Robot) */}
							<motion.div
								initial={{ y: -5, rotate: -8 }}
								animate={{ y: [4, -4, 4] }}
								transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
								className='absolute right-0 bottom-1 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
								style={{
									transform: 'perspective(800px) rotateY(-20deg) rotateX(15deg)',
								}}>
								<Bot size={14} />
							</motion.div>
						</div>

						{/* Action Button */}
						<div className='z-10 shrink-0 self-start md:self-center'>
							<motion.button
								whileHover={{
									scale: 1.02,
									boxShadow: '0 0 20px rgba(124, 58, 237, 0.35)',
								}}
								whileTap={{ scale: 0.98 }}
								onClick={() => navigate(pages.editor.subPages.addWorkflow.to)}
								className='flex h-10.5 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-xs font-bold text-white shadow-md shadow-violet-500/10 transition-all hover:brightness-110 active:scale-95'>
								<Zap size={14} strokeWidth={3} />
								<span>Quick Run</span>
							</motion.button>
						</div>
					</div>
				</motion.div>

				{/* Onboarding Checklist — shown until completed or dismissed */}
				<AnimatePresence>
					{onboarding && !onboarding.is_complete && !onboarding.is_dismissed && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10, height: 0 }}
							transition={{ duration: 0.3 }}
							className='overflow-hidden rounded-3xl border border-violet-100 bg-white p-5 shadow-[0_4px_25px_rgba(124,58,237,0.03)] dark:border-zinc-800/80 dark:bg-[#10131e]/30'>
							<div className='flex flex-wrap items-start justify-between gap-4'>
								<div>
									<p className='text-[10px] font-black tracking-[0.18em] text-violet-600 uppercase dark:text-violet-400'>
										ACCOUNT SETUP
									</p>
									<h2 className='mt-1 text-sm font-black text-slate-950 dark:text-white'>
										{onboarding.progress} of {onboarding.total} milestones
										complete
									</h2>
								</div>
								<div className='flex items-center gap-4.5'>
									<button
										onClick={() => {}}
										className='flex items-center gap-1 text-[11px] font-bold text-slate-500 transition-colors hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white'>
										View all <ArrowRight size={11} />
									</button>
									<button
										type='button'
										onClick={() => setOnboarding(prev => ({ ...prev, is_dismissed: true }))}
										className='hover:text-slate-650 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-slate-50 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'>
										<X className='h-3.5 w-3.5' />
										Dismiss
									</button>
								</div>
							</div>

							<div className='mt-3 h-1.5 overflow-hidden rounded-full bg-violet-100/50 dark:bg-violet-900/20'>
								<div
									className='h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500'
									style={{
										width: `${Math.min(100, (onboarding.progress / Math.max(onboarding.total, 1)) * 100)}%`,
									}}
								/>
							</div>

							<div className='mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
								{onboarding.steps.map((item) => {
									const isNext = nextOnboardingStep?.key === item.key;
									const IconComp = onboardingIcons[item.key] || Circle;

									// Dynamic card classes
									let cardBorder =
										'border-slate-200/80 bg-white dark:border-zinc-800/40 dark:bg-[#10131e]/20';
									let iconStyle =
										'bg-slate-50 text-slate-400 dark:bg-zinc-900 dark:text-zinc-600';
									let statusIcon = (
										<Circle className='h-4 w-4 shrink-0 text-slate-300 dark:text-zinc-600' />
									);

									if (item.done) {
										if (isNext) {
											cardBorder =
												'border-violet-400 bg-white shadow-md shadow-violet-500/[0.02] dark:border-violet-500/40 dark:bg-[#11131c]';
											iconStyle =
												'bg-violet-100/60 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400';
											statusIcon = (
												<div className='flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-600 text-white'>
													<Check className='h-3 w-3 stroke-[3]' />
												</div>
											);
										} else {
											cardBorder =
												'border-slate-200/80 bg-white dark:border-zinc-800/40 dark:bg-[#10131e]/20';
											iconStyle =
												'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
											statusIcon = (
												<div className='flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white'>
													<Check className='h-3 w-3 stroke-[3]' />
												</div>
											);
										}
									} else {
										if (isNext) {
											cardBorder =
												'border-violet-400 bg-white shadow-md shadow-violet-500/[0.02] dark:border-violet-500/40 dark:bg-[#11131c]';
											iconStyle =
												'bg-violet-100/60 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400';
											statusIcon = (
												<Circle className='h-4.5 w-4.5 shrink-0 stroke-[2] text-violet-500' />
											);
										}
									}

									return (
										<button
											key={item.key}
											type='button'
											onClick={() => handleOnboardingAction(item.key)}
											className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:border-violet-400 hover:shadow-md hover:shadow-violet-500/[0.01] ${cardBorder}`}>
											<div className='flex min-w-0 flex-1 items-center gap-3.5'>
												{/* Left step icon */}
												<div
													className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconStyle}`}>
													<IconComp size={16} />
												</div>

												{/* Step content */}
												<div className='min-w-0 flex-1'>
													<span
														className={`block truncate text-xs font-black transition-colors ${item.done ? 'text-slate-500 dark:text-zinc-400' : 'text-slate-805 dark:text-zinc-100'}`}>
														{item.label}
													</span>
													<span className='mt-0.5 block truncate text-[10px] leading-relaxed font-semibold text-slate-400 dark:text-zinc-500'>
														{item.description}
													</span>
												</div>
											</div>

											{/* Right side check status */}
											<div className='shrink-0 pl-1'>{statusIcon}</div>
										</button>
									);
								})}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Stats Grid */}
				<section className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
					{stats.map((stat, i) => {
						const IconComponent = stat.icon;
						return (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.07, duration: 0.3 }}
								whileHover={{ y: -3 }}
								className={`group relative flex min-h-[105px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/50 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)] backdrop-blur-xl transition-all duration-300 dark:border-zinc-800/80 dark:bg-[#10131e]/50 ${stat.glowClass}`}>
								{/* Sparkline element */}
								<div className='pointer-events-none absolute right-0 bottom-0 left-0 h-9 w-full overflow-hidden opacity-90'>
									<svg
										className='h-full w-full overflow-visible'
										viewBox='0 0 100 30'
										preserveAspectRatio='none'>
										<defs>
											<linearGradient
												id={`grad-${i}`}
												x1='0'
												y1='0'
												x2='0'
												y2='1'>
												<stop
													offset='0%'
													stopColor={stat.sparkColor}
													stopOpacity='0.25'
												/>
												<stop
													offset='100%'
													stopColor={stat.sparkColor}
													stopOpacity='0.0'
												/>
											</linearGradient>
										</defs>
										<path
											d={stat.sparkPath}
											fill='none'
											stroke={stat.sparkColor}
											strokeWidth='2.2'
											strokeLinecap='round'
											strokeLinejoin='round'
										/>
										<path
											d={`${stat.sparkPath} L 100 30 L 0 30 Z`}
											fill={`url(#grad-${i})`}
										/>
										{/* Glowing dot at the end of trend line */}
										<circle
											cx={stat.endX}
											cy={stat.endY}
											r='2'
											fill={stat.sparkColor}
											className='animate-pulse'
										/>
										<circle
											cx={stat.endX}
											cy={stat.endY}
											r='4.5'
											fill={stat.sparkColor}
											opacity='0.3'
											className='animate-ping'
											style={{
												transformOrigin: `${stat.endX}px ${stat.endY}px`,
											}}
										/>
									</svg>
								</div>

								<div className='relative z-10 flex items-center gap-4.5'>
									{/* Icon on the Left */}
									<div
										className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 ${stat.iconBg}`}>
										<IconComponent size={18} />
									</div>

									{/* Stats Text on the Right */}
									<div className='min-w-0 flex-1 space-y-0.5'>
										<span className='block text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
											{stat.label}
										</span>
										<span className='text-2.5xl block leading-none font-black tracking-tight text-slate-900 dark:text-white'>
											{stat.value}
										</span>
										<div className='flex items-center gap-1.5 pt-0.5'>
											{i === 0 && (
												<span className='flex items-center gap-0.5 text-[11px] font-extrabold text-[#10b981] dark:text-emerald-400'>
													<span className='text-[10px]'>↑</span>
													<span>{stat.sub}</span>
												</span>
											)}
											{i === 1 && (
												<span className='dark:text-blue-450 flex items-center gap-1.5 text-[11px] font-extrabold text-[#3b82f6]'>
													<span className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500' />
													<span>{stat.sub}</span>
												</span>
											)}
											{i === 2 && (
												<span className='flex items-center gap-1.5 text-[11px] font-extrabold text-[#f59e0b] dark:text-amber-500'>
													<span className='h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500' />
													<span>{stat.sub}</span>
												</span>
											)}
											{i === 3 && (
												<span className='flex items-center gap-0.5 text-[11px] font-extrabold text-[#10b981] dark:text-emerald-400'>
													<span className='text-[10px]'>↑</span>
													<span>{stat.sub}</span>
												</span>
											)}
										</div>
									</div>
								</div>
							</motion.div>
						);
					})}
				</section>

				<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
					{/* Recent Workflows */}
					<div className='overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] lg:col-span-2 dark:border-zinc-800/40 dark:bg-[#10131e]/30'>
						<div className='flex items-center justify-between border-b border-slate-100/50 px-5 py-4.5 dark:border-zinc-800/50'>
							<span className='text-xs font-black tracking-widest text-slate-700 uppercase dark:text-zinc-200'>
								RECENT WORKFLOWS
							</span>
							<button className='flex cursor-pointer items-center gap-1 text-[11px] font-bold text-slate-500 transition-colors hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white'>
								View all <ArrowRight size={11} />
							</button>
						</div>
						<div className='divide-y divide-slate-100/40 dark:divide-zinc-800/30'>
							{recentWorkflows.map((wf) => (
								<div
									key={wf.id}
									onClick={() =>
										navigate(
											`${pages.editor.subPages.editWorkflow.to}/${activeWorkspaceId}/${wf.id}`,
										)
									}
									className='group flex cursor-pointer items-center justify-between px-5 py-4 transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-zinc-800/15'>
									<div className='flex items-center gap-3.5'>
										<div className='text-violet-650 flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50/30 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 dark:border-violet-500/10 dark:bg-violet-500/10 dark:text-violet-400'>
											<GitMerge size={16} />
										</div>
										<div>
											<p className='text-xs font-bold text-slate-800 transition-colors group-hover:text-violet-600 dark:text-zinc-200 dark:group-hover:text-violet-400'>
												{wf.title}
											</p>
											<p className='mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-zinc-500'>
												<Clock size={10} /> {wf.lastRun}
											</p>
										</div>
									</div>
									<div
										className='flex items-center gap-3.5'
										onClick={(e) => e.stopPropagation()}>
										<span className='rounded border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400'>
											{wf.successRate}% Success
										</span>
										<span className='bg-emerald-550/5 text-emerald-650 flex items-center gap-1 rounded-full border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase dark:bg-emerald-500/10 dark:text-emerald-400'>
											<span className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500' />
											{wf.status}
										</span>
										<button
											onClick={(e) => {
												e.stopPropagation();
											}}
											className='flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-xl bg-slate-100 shadow-xs transition-all hover:scale-105 hover:bg-violet-600 hover:text-white active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-violet-600 dark:hover:text-white'>
											<Play size={10} className='fill-current' />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
											}}
											className='hover:text-slate-605 flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 active:scale-95 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'>
											<MoreVertical size={14} />
										</button>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Quick Actions */}
					<div className='overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:border-zinc-800/40 dark:bg-[#10131e]/30'>
						<div className='flex items-center gap-2 border-b border-slate-100/50 px-5 py-4.5 dark:border-zinc-800/50'>
							<span className='text-xs font-black tracking-widest text-slate-700 uppercase dark:text-zinc-200'>
								QUICK ACTIONS
							</span>
						</div>
						<div className='space-y-3.5 p-5'>
							{quickActions.map((action, index) => {
								const ActionIcon = action.icon;
								const handleActionClick = () => {
									if (index === 0) navigate(pages.editor.subPages.addWorkflow.to);
									else if (index === 1) navigate(pages.app.subPages.agents.to);
									else if (index === 2) navigate(pages.app.subPages.apps.to);
									else if (index === 3) navigate(pages.app.subPages.templates.to);
								};
								return (
									<motion.button
										whileHover={{ scale: 1.015, y: -1 }}
										whileTap={{ scale: 0.985 }}
										key={action.label}
										onClick={handleActionClick}
										className={`group flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border p-4 text-left shadow-xs backdrop-blur-md transition-all ${action.color}`}>
										<div
											className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:rotate-3 ${action.iconStyle}`}>
											<ActionIcon size={15} />
										</div>
										<div className='min-w-0 flex-1'>
											<p
												className={`text-xs font-bold text-slate-900 transition-colors dark:text-white ${action.hoverText}`}>
												{action.label}
											</p>
											<p className='mt-0.5 text-[10px] leading-normal font-semibold text-slate-400 dark:text-zinc-500'>
												{action.description}
											</p>
										</div>
										<ChevronRight
											size={13}
											className='ml-auto text-slate-400 opacity-80 transition-all group-hover:translate-x-1 group-hover:text-current'
										/>
									</motion.button>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
};

export default DashboardPage;
