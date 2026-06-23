import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Search,
	Plus,
	MoreVertical,
	LogOut,
	Sun,
	Moon,
	Trash2,
	Edit2,
	UserPlus,
	ArrowRight,
	Zap,
	Grid,
	Info,
	Check,
	X,
	Layers,
	Cpu,
	Bell,
} from 'lucide-react';
import useDarkMode from '@/hooks/useDarkMode';
import DARK_MODE from '@/constants/darkMode.constant';
import { useAuth } from '@/context/authContext';
import type { TWorkspace } from '@/types/workspace.type';
import { useWorkflowShellStore } from '@/store/workflowShell.store';

// Mock workspaces hooks for local operation
const useWorkspaces = () => {
	const { workspaces } = useWorkflowShellStore();
	const mappedData: TWorkspace[] = workspaces.map(ws => ({
		id: ws.id,
		name: ws.name,
		slug: ws.id,
		role: 'owner',
		created_at: new Date().toISOString(),
	}));
	return { data: { data: mappedData }, isLoading: false };
};

const useCreateWorkspace = () => {
	const { addWorkspace } = useWorkflowShellStore();
	return {
		isPending: false,
		mutateAsync: async (body: { name: string; slug?: string }) => {
			const newId = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
			addWorkspace({
				id: newId,
				name: body.name,
				description: 'Created from settings',
				initials: body.name.slice(0, 2).toUpperCase(),
				color: 'bg-violet-600',
			});
			return { id: newId };
		}
	};
};

const useUpdateWorkspace = () => {
	const { updateWorkspace } = useWorkflowShellStore();
	return {
		isPending: false,
		mutateAsync: async (payload: { id: string; body: { name: string } }) => {
			updateWorkspace(payload.id, payload.body.name);
			return {};
		}
	};
};

const useDeleteWorkspace = () => {
	const { deleteWorkspace } = useWorkflowShellStore();
	return {
		isPending: false,
		mutateAsync: async (id: string) => {
			deleteWorkspace(id);
			return {};
		}
	};
};

const useLeaveWorkspace = () => {
	const { deleteWorkspace } = useWorkflowShellStore();
	return {
		isPending: false,
		mutateAsync: async (id: string) => {
			deleteWorkspace(id);
			return {};
		}
	};
};
import Spinner from '@/components/ui/Spinner';

// ─── count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1300, delay = 250) {
	const [count, setCount] = useState(0);
	useEffect(() => {
		let raf: number;
		const timer = setTimeout(() => {
			const start = performance.now();
			const tick = (now: number) => {
				const p = Math.min((now - start) / duration, 1);
				const e = 1 - Math.pow(1 - p, 3);
				setCount(Math.round(target * e));
				if (p < 1) raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
		}, delay);
		return () => {
			clearTimeout(timer);
			cancelAnimationFrame(raf);
		};
	}, [target, duration, delay]);
	return count;
}

const SPARK_DATA = [40, 55, 35, 70, 50, 85, 60, 95, 75, 100];

// ─── helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
	name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

const slugify = (v: string) =>
	v
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

// ─── types ─────────────────────────────────────────────────────────────────────
interface ITeammate {
	name: string;
	initials: string;
	color: string;
}

interface IWorkspaceCard {
	id: string;
	name: string;
	tier: 'Free' | 'Pro' | 'Enterprise';
	role: 'Owner' | 'Admin' | 'Member';
	activeFlowsCount: number;
	totalNodes: number;
	activeAgentsCount: number;
	members: ITeammate[];
	gradientFrom: string;
	gradientTo: string;
	accentColor: string;
	lastActive: string;
	hasActiveRuns: boolean;
}

interface IInvitation {
	id: string;
	name: string;
	inviter: string;
	membersCount: number;
	gradientFrom: string;
	gradientTo: string;
}

interface Theme {
	surface: string;
	surface2: string;
	bodyBg: string;
	lineSoft: string;
	textColor: string;
	mutedColor: string;
	faintColor: string;
	isDark: boolean;
}

// ─── constants ─────────────────────────────────────────────────────────────────
const initialInvitations: IInvitation[] = [
	{
		id: 'invite-1',
		name: 'Marketing Automations',
		inviter: 'David Kim',
		membersCount: 4,
		gradientFrom: '#ff4d8d',
		gradientTo: '#ff7a59',
	},
	{
		id: 'invite-2',
		name: 'Development Sandbox',
		inviter: 'Sarah Connor',
		membersCount: 2,
		gradientFrom: '#16d6c5',
		gradientTo: '#3b82f6',
	},
];

const GRADIENTS = [
	{ from: '#ff7a59', to: '#ff4d8d', accent: 'oklch(0.7 0.2 25)' },
	{ from: '#ff6a3d', to: '#ff9a3d', accent: 'oklch(0.72 0.2 30)' },
	{ from: '#7c5cff', to: '#b06cff', accent: 'oklch(0.66 0.21 292)' },
	{ from: '#16d6c5', to: '#0ea5a0', accent: 'oklch(0.78 0.15 168)' },
	{ from: '#f12711', to: '#f5af19', accent: 'oklch(0.74 0.18 42)' },
	{ from: '#8e2de2', to: '#4a00e0', accent: 'oklch(0.55 0.22 292)' },
];

const THEME_OPTIONS = [
	{ label: 'Sunset', from: '#ff7a59', to: '#ff4d8d' },
	{ label: 'Cosmic', from: '#7c5cff', to: '#b06cff' },
	{ label: 'Neon', from: '#00c6ff', to: '#0072ff' },
	{ label: 'Forest', from: '#11998e', to: '#38ef7d' },
	{ label: 'Lemon', from: '#f12711', to: '#f5af19' },
	{ label: 'Cyber', from: '#8e2de2', to: '#4a00e0' },
];

const TABS = [
	{ id: 'all', label: 'All Workspaces' },
	{ id: 'active', label: 'Active Flows' },
	{ id: 'premium', label: 'Premium' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const PLAN_TIERS = [
	{ name: 'Free', desc: 'Free forever. Basic features.' },
	{ name: 'Pro', desc: '$15/mo. Team collaboration.' },
	{ name: 'Enterprise', desc: 'Custom. Advanced SLA.' },
] as const;

type TierName = (typeof PLAN_TIERS)[number]['name'];

// ─── mapping ───────────────────────────────────────────────────────────────────
const mapApiWorkspaceToCard = (w: TWorkspace, currentUserId?: string): IWorkspaceCard => {
	const index = w.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const g = GRADIENTS[index % GRADIENTS.length];

	let role: 'Owner' | 'Admin' | 'Member' = 'Member';
	if (w.role === 'owner') role = 'Owner';
	else if (w.role === 'admin') role = 'Admin';
	else if (w.owner?.id && currentUserId && w.owner.id === currentUserId) role = 'Owner';

	const tier: TierName = role === 'Owner' ? 'Enterprise' : role === 'Admin' ? 'Pro' : 'Free';

	const members: ITeammate[] = [{ name: 'Amaan', initials: 'AM', color: 'bg-pink-500' }];

	let lastActive = 'Active now';
	if (w.created_at) {
		const diffMins = Math.floor((Date.now() - new Date(w.created_at).getTime()) / 60000);
		if (diffMins < 1) lastActive = 'Created just now';
		else if (diffMins < 60) lastActive = `Active ${diffMins}m ago`;
		else {
			const diffHours = Math.floor(diffMins / 60);
			lastActive =
				diffHours < 24
					? `Active ${diffHours}h ago`
					: `Active ${Math.floor(diffHours / 24)}d ago`;
		}
	}

	return {
		id: w.id,
		name: w.name,
		tier,
		role,
		activeFlowsCount: role === 'Owner' ? 4 : role === 'Admin' ? 2 : 0,
		totalNodes: role === 'Owner' ? 12 : role === 'Admin' ? 5 : 0,
		activeAgentsCount: role === 'Owner' ? 1 : 0,
		members,
		gradientFrom: g.from,
		gradientTo: g.to,
		accentColor: g.accent,
		lastActive,
		hasActiveRuns: role === 'Owner',
	};
};

// ─── component ─────────────────────────────────────────────────────────────────
const WorkspacesPage = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const { isDarkTheme, setDarkModeStatus } = useDarkMode();
	const { setActiveWorkspaceId } = useWorkflowShellStore();
	const { userData } = useAuth();

	// API
	const { data: workspacesResponse, isLoading } = useWorkspaces();
	const createWorkspaceMutation = useCreateWorkspace();
	const updateWorkspaceMutation = useUpdateWorkspace();
	const deleteWorkspaceMutation = useDeleteWorkspace();
	const leaveWorkspaceMutation = useLeaveWorkspace();

	const [invitations, setInvitations] = useState<IInvitation[]>(initialInvitations);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<TabId>('all');
	const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(
		() => searchParams.get('create') === 'true',
	);
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
	const [selectedWorkspace, setSelectedWorkspace] = useState<IWorkspaceCard | null>(null);

	// Create form state
	const [newWspName, setNewWspName] = useState('');
	const [newWspSlug, setNewWspSlug] = useState('');
	const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
	const [newWspTier, setNewWspTier] = useState<TierName>('Free');
	const [newWspThemeIdx, setNewWspThemeIdx] = useState(0);
	const [renameWspName, setRenameWspName] = useState('');

	const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const creditBarRef = useRef<HTMLDivElement>(null);

	// Clean ?create=true from the URL after reading it into state on mount
	useEffect(() => {
		if (searchParams.get('create') !== 'true') return;
		const newParams = new URLSearchParams(searchParams);
		newParams.delete('create');
		setSearchParams(newParams, { replace: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const t = setTimeout(() => {
			if (creditBarRef.current) creditBarRef.current.style.width = '85.6%';
		}, 500);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				searchInputRef.current?.focus();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	useEffect(() => {
		const handleGlobalClick = () => setActiveMenuId(null);
		window.addEventListener('click', handleGlobalClick);
		return () => window.removeEventListener('click', handleGlobalClick);
	}, []);

	const workspaces = useMemo(
		() => (workspacesResponse?.data ?? []).map((w: TWorkspace) => mapApiWorkspaceToCard(w, userData?.id)),
		[workspacesResponse?.data, userData?.id],
	);

	const filteredWorkspaces = useMemo(() => {
		let result = workspaces;
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			result = result.filter((w: IWorkspaceCard) => w.name.toLowerCase().includes(q));
		}
		if (selectedCategory === 'active') result = result.filter((w: IWorkspaceCard) => w.activeFlowsCount > 0);
		else if (selectedCategory === 'premium')
			result = result.filter((w: IWorkspaceCard) => w.tier === 'Pro' || w.tier === 'Enterprise');
		return result;
	}, [workspaces, searchQuery, selectedCategory]);

	const totalFlows = useMemo(
		() => workspaces.reduce((sum: number, w: IWorkspaceCard) => sum + w.activeFlowsCount, 0),
		[workspaces],
	);

	const wsCount = useCountUp(workspaces.length, 1000, 300);
	const flowCountUp = useCountUp(totalFlows, 1000, 450);
	const creditCountUp = useCountUp(4280, 1300, 350);

	const handleNameChange = (val: string) => {
		setNewWspName(val);
		if (!isSlugManuallyEdited) setNewWspSlug(slugify(val));
	};

	const handleSlugChange = (val: string) => {
		setNewWspSlug(slugify(val));
		setIsSlugManuallyEdited(true);
	};

	const resetCreateForm = () => {
		setNewWspName('');
		setNewWspSlug('');
		setIsSlugManuallyEdited(false);
		setNewWspTier('Free');
		setNewWspThemeIdx(0);
	};

	const closeCreateModal = () => {
		setIsCreateModalOpen(false);
		resetCreateForm();
	};

	const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3000);
	};

	const handleSelectWorkspace = (id: string) => {
		const name = workspaces.find((w: IWorkspaceCard) => w.id === id)?.name ?? 'workspace';
		triggerToast(`Entering workspace "${name}"...`, 'info');
		setActiveWorkspaceId(id);
		setTimeout(() => navigate('/my-workspace'), 800);
	};

	const handleCreateWorkspace = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newWspName.trim() || !newWspSlug.trim()) return;
		try {
			const name = newWspName.trim();
			await createWorkspaceMutation.mutateAsync({ name, slug: newWspSlug.trim() });
			closeCreateModal();
			triggerToast(`Workspace "${name}" created!`);
		} catch {
			// handled by hook
		}
	};

	const handleRenameWorkspace = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!renameWspName.trim() || !selectedWorkspace) return;
		try {
			await updateWorkspaceMutation.mutateAsync({
				id: selectedWorkspace.id,
				body: { name: renameWspName.trim() },
			});
			setRenameWspName('');
			setSelectedWorkspace(null);
			setIsRenameModalOpen(false);
			triggerToast('Workspace renamed successfully');
		} catch {
			// handled by hook
		}
	};

	const handleDeleteWorkspace = async (id: string, name: string) => {
		try {
			await deleteWorkspaceMutation.mutateAsync(id);
			triggerToast(`Deleted workspace "${name}"`, 'info');
		} catch {
			// handled by hook
		}
	};

	const handleLeaveWorkspace = async (id: string, name: string) => {
		try {
			await leaveWorkspaceMutation.mutateAsync(id);
			triggerToast(`Left workspace "${name}"`, 'info');
		} catch {
			// handled by hook
		}
	};

	const handleAcceptInvite = (invite: IInvitation) => {
		setInvitations((prev) => prev.filter((i) => i.id !== invite.id));
		triggerToast(`Joined "${invite.name}" team workspace!`);
	};

	const handleDeclineInvite = (id: string, name: string) => {
		setInvitations((prev) => prev.filter((i) => i.id !== id));
		triggerToast(`Declined invitation from "${name}"`, 'info');
	};

	// ─── theme ─────────────────────────────────────────────────────────────────
	const surface = isDarkTheme ? '#181526' : '#ffffff';
	const surface2 = isDarkTheme ? '#1e1b2e' : '#f4f3fa';
	const bodyBg = isDarkTheme ? '#0f0d18' : '#f8f7fc';
	const lineSoft = isDarkTheme ? 'rgba(100,95,160,0.28)' : 'rgba(100,95,160,0.18)';
	const textColor = isDarkTheme ? '#f5f4f8' : '#1a1825';
	const mutedColor = isDarkTheme ? '#b0aec0' : '#5e5a72';
	const faintColor = isDarkTheme ? '#8e8ba0' : '#8e8ba0';

	const theme: Theme = {
		surface,
		surface2,
		bodyBg,
		lineSoft,
		textColor,
		mutedColor,
		faintColor,
		isDark: isDarkTheme,
	};

	const userDisplayName =
		(userData as { name?: string } | null)?.name ??
		(userData as { email?: string } | null)?.email?.split('@')[0] ??
		'User';
	const userInitials = getInitials(userDisplayName);
	const selectedTheme = THEME_OPTIONS[newWspThemeIdx];

	return (
		<div
			className='relative min-h-screen overflow-x-hidden transition-colors duration-500'
			style={{ background: bodyBg, color: textColor, fontFamily: 'Manrope, sans-serif' }}>
			<style>{`
				@keyframes wsGrow { from { transform: scaleY(0); } }
				@keyframes wsPulse {
					0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.7); }
					70%  { box-shadow: 0 0 0 9px transparent; }
					100% { box-shadow: 0 0 0 0 transparent; }
				}
				.ws-spark-bar { flex: 1; background: linear-gradient(180deg,#7c5cff,transparent); border-radius: 3px; opacity: 0.85; transform-origin: bottom; animation: wsGrow 0.9s cubic-bezier(0.22,0.61,0.36,1) backwards; }
				.ws-pulse-dot { animation: wsPulse 2s infinite; }
				.ws-btn-sheen { position: relative; overflow: hidden; }
				.ws-btn-sheen::after { content: ""; position: absolute; top: 0; left: -60%; width: 45%; height: 100%; transform: skewX(-20deg); background: linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent); transition: left 0.6s cubic-bezier(0.22,0.61,0.36,1); }
				.ws-btn-sheen:hover::after { left: 130%; }
			`}</style>

			{/* ── Aurora backdrop ── */}
			<div className='pointer-events-none fixed inset-0 z-0 overflow-hidden'>
				<div
					className='absolute rounded-full'
					style={{
						width: 680,
						height: 680,
						left: -220,
						top: -300,
						filter: 'blur(120px)',
						opacity: isDarkTheme ? 0.16 : 0.08,
						background: 'radial-gradient(circle at 30% 30%, #7c5cff, transparent 62%)',
					}}
				/>
				<div
					className='absolute rounded-full'
					style={{
						width: 560,
						height: 560,
						right: -200,
						top: -240,
						filter: 'blur(120px)',
						opacity: isDarkTheme ? 0.14 : 0.07,
						background: 'radial-gradient(circle at 60% 40%, #9955ff, transparent 60%)',
					}}
				/>
			</div>

			{/* ── Grid noise ── */}
			<div
				className='pointer-events-none fixed inset-0 z-0'
				style={{
					opacity: isDarkTheme ? 0.22 : 0.12,
					backgroundImage: `linear-gradient(${lineSoft} 1px, transparent 1px), linear-gradient(90deg, ${lineSoft} 1px, transparent 1px)`,
					backgroundSize: '54px 54px',
					maskImage:
						'radial-gradient(ellipse 80% 55% at 50% 0%, #000 30%, transparent 75%)',
				}}
			/>

			{/* ── Toast ── */}
			<AnimatePresence>
				{toast && (
					<motion.div
						initial={{ opacity: 0, y: -20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -20, scale: 0.95 }}
						className='fixed top-6 right-6 z-[110] flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl'
						style={{
							background: surface,
							border: `1px solid rgba(124,92,255,0.35)`,
							boxShadow: '0 20px 60px -20px rgba(0,0,0,0.8)',
						}}>
						<div
							className='flex h-6 w-6 items-center justify-center rounded-full'
							style={{ background: 'rgba(124,92,255,0.16)', color: '#7c5cff' }}>
							<Check size={13} strokeWidth={3} />
						</div>
						<span className='text-xs font-bold' style={{ color: textColor }}>
							{toast.message}
						</span>
					</motion.div>
				)}
			</AnimatePresence>

			{/* ── NAV ── */}
			<div className='sticky top-0 z-30 px-6 pt-4 pb-2 md:px-8'>
				<div className='mx-auto max-w-[1240px]'>
					<nav
						className='flex items-center justify-between px-4 py-3'
						style={{
							borderRadius: 18,
							border: `1px solid ${lineSoft}`,
							background: surface,
							boxShadow: isDarkTheme
								? '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.8)'
								: '0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 20px -8px rgba(100,95,160,0.15)',
						}}>
						{/* Brand */}
						<div
							role='button'
							tabIndex={0}
							className='flex cursor-pointer items-center gap-3'
							onClick={() => navigate('/my-workspace')}
							onKeyDown={(e) => e.key === 'Enter' && navigate('/my-workspace')}>
							<div
								className='flex h-[38px] w-[38px] items-center justify-center rounded-xl text-lg font-bold text-white'
								style={{
									background: 'linear-gradient(140deg, #7c5cff, #9955ff)',
									boxShadow: '0 6px 20px -6px rgba(124,92,255,0.8)',
								}}>
								a
							</div>
							<span
								className='text-[19px] font-bold tracking-tight'
								style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
								<span style={{ color: textColor }}>agent</span>
								<span style={{ color: '#7c5cff' }}>1o1</span>
							</span>
							<span
								className='ml-1 rounded-full px-2.5 py-1 text-[11px] font-semibold'
								style={{
									color: faintColor,
									border: `1px solid ${lineSoft}`,
									fontFamily: 'Space Grotesk, sans-serif',
								}}>
								v2.4
							</span>
						</div>

						{/* Right side */}
						<div className='flex items-center gap-3.5'>
							<button
								onClick={() =>
									setDarkModeStatus(
										isDarkTheme ? DARK_MODE.LIGHT : DARK_MODE.DARK,
									)
								}
								className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all'
								style={{
									border: `1px solid ${lineSoft}`,
									background: `linear-gradient(180deg, ${surface2}, ${surface})`,
									color: faintColor,
								}}>
								{isDarkTheme ? (
									<Sun size={17} className='text-amber-400' />
								) : (
									<Moon size={17} />
								)}
							</button>

							<button
								className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all'
								style={{
									border: `1px solid ${lineSoft}`,
									background: `linear-gradient(180deg, ${surface2}, ${surface})`,
									color: faintColor,
								}}>
								<Bell size={17} />
							</button>

							<div
								className='flex cursor-pointer items-center gap-2.5 rounded-[14px] px-3 py-1.5 transition-all'
								style={{ border: `1px solid ${lineSoft}`, background: surface2 }}>
								<div
									className='flex h-8 w-8 items-center justify-center rounded-[9px] text-xs font-bold text-white'
									style={{
										background: 'linear-gradient(140deg, #7c5cff, #9955ff)',
									}}>
									{userInitials}
								</div>
								<div className='hidden sm:block'>
									<div
										className='text-[13px] leading-tight font-bold'
										style={{ color: textColor }}>
										{userDisplayName}
									</div>
									<div className='text-[11px]' style={{ color: faintColor }}>
										Account
									</div>
								</div>
							</div>
						</div>
					</nav>
				</div>
			</div>

			{/* ── MAIN ── */}
			<main className='relative z-[1] mx-auto max-w-[1240px] px-6 pb-24 md:px-8'>
				{/* HERO */}
				<section className='mt-12 mb-10 flex flex-wrap items-end justify-between gap-8'>
					<div>
						<div
							className='mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase'
							style={{ color: '#7c5cff', fontFamily: 'Space Grotesk, sans-serif' }}>
							<span
								className='inline-block h-[7px] w-[7px] rounded-full'
								style={{
									background: '#7c5cff',
									boxShadow: '0 0 12px 2px rgba(124,92,255,0.8)',
								}}
							/>
							Workspace Orchestration
						</div>
						<h1
							className='leading-none tracking-[-0.03em]'
							style={{
								fontFamily: 'Space Grotesk, sans-serif',
								fontSize: 'clamp(40px, 5.6vw, 62px)',
								fontWeight: 700,
								background: isDarkTheme
									? 'linear-gradient(180deg, #ffffff 0%, #a78bfa 100%)'
									: 'linear-gradient(180deg, #1a1825 30%, #7c5cff 100%)',
								WebkitBackgroundClip: 'text',
								backgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								color: 'transparent',
							}}>
							Workspaces
						</h1>
						<p
							className='mt-4 max-w-[460px] text-[15.5px] leading-[1.55]'
							style={{ color: mutedColor }}>
							Welcome back! Select a workspace to orchestrate AI workflows, monitor
							live agents, or wire up new integrations.
						</p>
					</div>

					<button
						onClick={() => setIsCreateModalOpen(true)}
						className='ws-btn-sheen inline-flex cursor-pointer items-center gap-2.5 rounded-[14px] text-[14.5px] font-bold text-white'
						style={{
							padding: '14px 22px',
							background: 'linear-gradient(135deg, #7c5cff, #9955ff)',
							boxShadow:
								'0 1px 0 rgba(255,255,255,0.35) inset, 0 0 0 1px rgba(128,80,255,0.6), 0 8px 18px -8px rgba(128,80,255,0.85)',
						}}>
						<Plus size={18} strokeWidth={2.4} />
						Create Workspace
					</button>
				</section>

				{/* STAT CARDS */}
				<section className='mb-10 grid grid-cols-1 gap-[18px] sm:grid-cols-3'>
					<StatCard theme={theme}>
						<div className='flex items-start justify-between'>
							<StatLabel theme={theme}>Total Workspaces</StatLabel>
							<StatIcon theme={theme}>
								<Grid size={20} style={{ color: '#7c5cff' }} />
							</StatIcon>
						</div>
						<StatNumber theme={theme}>{wsCount}</StatNumber>
						<div
							className='mt-3.5 flex items-center gap-1.5 text-[13px]'
							style={{ color: mutedColor }}>
							<span className='font-bold' style={{ color: '#34d399' }}>
								+1
							</span>
							active environment this week
						</div>
					</StatCard>

					<StatCard theme={theme}>
						<div className='flex items-start justify-between'>
							<StatLabel theme={theme}>Flows Running</StatLabel>
							<StatIcon theme={theme}>
								<Zap size={20} className='fill-amber-400 text-amber-400' />
							</StatIcon>
						</div>
						<StatNumber theme={theme}>{flowCountUp}</StatNumber>
						<div className='mt-3.5 flex h-[26px] items-end gap-[3px]'>
							{SPARK_DATA.map((v, i) => (
								<div
									key={i}
									className='ws-spark-bar'
									style={{
										height: `${v}%`,
										animationDelay: `${0.3 + i * 0.05}s`,
									}}
								/>
							))}
						</div>
					</StatCard>

					<StatCard theme={theme}>
						<div className='flex items-start justify-between'>
							<StatLabel theme={theme}>Available Credits</StatLabel>
							<StatIcon theme={theme}>
								<Info size={20} style={{ color: '#34d399' }} />
							</StatIcon>
						</div>
						<div
							className='mt-4 leading-none tracking-[-0.02em]'
							style={{
								fontFamily: 'Space Grotesk, sans-serif',
								fontSize: 42,
								fontWeight: 700,
								color: textColor,
							}}>
							{creditCountUp.toLocaleString()}
							<span
								className='ml-1 text-[21px] font-medium'
								style={{ color: faintColor }}>
								/ 5,000
							</span>
						</div>
						<div
							className='mt-[18px] h-2 overflow-hidden rounded-full'
							style={{ background: surface2, border: `1px solid ${lineSoft}` }}>
							<div
								ref={creditBarRef}
								className='h-full rounded-full transition-all duration-[1400ms]'
								style={{
									width: 0,
									background: 'linear-gradient(90deg, #7c5cff, #9955ff)',
									boxShadow: '0 0 14px rgba(124,92,255,0.6)',
								}}
							/>
						</div>
						<div className='mt-2.5 text-[13px]' style={{ color: mutedColor }}>
							85.6% of monthly quota remaining
						</div>
					</StatCard>
				</section>

				{/* TOOLBAR */}
				<div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
					<div
						className='flex gap-[5px] rounded-[14px] p-[5px]'
						style={{ border: `1px solid ${lineSoft}`, background: surface }}>
						{TABS.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setSelectedCategory(tab.id)}
								className='cursor-pointer rounded-[10px] px-[17px] py-[9px] text-[13px] font-semibold transition-all'
								style={{
									fontFamily: 'Space Grotesk, sans-serif',
									...(selectedCategory === tab.id
										? {
												color: '#fff',
												background:
													'linear-gradient(180deg, #7c5cff, #9955ff)',
												boxShadow:
													'0 1px 0 rgba(255,255,255,0.3) inset, 0 6px 14px -7px rgba(128,80,255,0.9)',
											}
										: { color: faintColor, background: 'transparent' }),
								}}>
								{tab.label}
							</button>
						))}
					</div>

					<div
						className='flex min-w-[280px] items-center gap-2.5 rounded-[13px] px-3.5 py-[11px] transition-all'
						style={{ border: `1px solid ${lineSoft}`, background: surface }}>
						<Search size={17} style={{ color: faintColor, flexShrink: 0 }} />
						<input
							ref={searchInputRef}
							type='text'
							aria-label='Search workspaces'
							placeholder='Search workspaces…'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='flex-1 border-none bg-transparent text-[14px] outline-none'
							style={{ color: textColor, fontFamily: 'Manrope, sans-serif' }}
						/>
						{searchQuery ? (
							<button
								onClick={() => setSearchQuery('')}
								style={{ color: faintColor }}
								className='transition-colors hover:text-rose-400'>
								<X size={14} />
							</button>
						) : (
							<kbd
								className='rounded px-1.5 py-0.5 text-[11px]'
								style={{
									color: faintColor,
									border: `1px solid ${lineSoft}`,
									fontFamily: 'Space Grotesk, sans-serif',
								}}>
								⌘K
							</kbd>
						)}
					</div>
				</div>

				{/* INVITATIONS */}
				<AnimatePresence>
					{invitations.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className='mb-12'>
							<div className='mb-4 flex items-center gap-3'>
								<span
									className='ws-pulse-dot inline-block h-2 w-2 rounded-full'
									style={{
										background: '#f59e0b',
										boxShadow: '0 0 0 0 rgba(245,158,11,0.7)',
									}}
								/>
								<span
									className='text-[12.5px] font-semibold tracking-[0.12em] uppercase'
									style={{
										color: faintColor,
										fontFamily: 'Space Grotesk, sans-serif',
									}}>
									Pending Invitations · {invitations.length}
								</span>
								<div
									className='h-px flex-1'
									style={{
										background: `linear-gradient(90deg, ${lineSoft}, transparent)`,
									}}
								/>
							</div>

							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
								{invitations.map((invite) => (
									<motion.div
										key={invite.id}
										whileHover={{ x: 3 }}
										className='relative flex flex-col items-start gap-4 overflow-hidden rounded-[14px] p-[18px] transition-all sm:flex-row sm:items-center'
										style={{
											border: `1px solid ${lineSoft}`,
											background: surface,
										}}>
										<div
											className='absolute top-0 bottom-0 left-0 w-[3px]'
											style={{
												background: `linear-gradient(to bottom, ${invite.gradientFrom}, ${invite.gradientTo})`,
											}}
										/>
										<div
											className='flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] text-[15px] font-bold text-white'
											style={{
												background: `linear-gradient(135deg, ${invite.gradientFrom}, ${invite.gradientTo})`,
											}}>
											{invite.name.slice(0, 2).toUpperCase()}
										</div>
										<div className='flex-1 pl-2 sm:pl-0'>
											<div
												className='text-[15px] font-semibold'
												style={{
													color: textColor,
													fontFamily: 'Space Grotesk, sans-serif',
												}}>
												{invite.name}
											</div>
											<div
												className='mt-0.5 text-[12.5px]'
												style={{ color: faintColor }}>
												Invited by{' '}
												<span
													className='font-semibold'
													style={{ color: '#7c5cff' }}>
													{invite.inviter}
												</span>{' '}
												· {invite.membersCount} members
											</div>
										</div>
										<div className='z-10 flex items-center gap-2 pl-2 sm:pl-0'>
											<button
												onClick={() =>
													handleDeclineInvite(invite.id, invite.name)
												}
												className='flex cursor-pointer items-center gap-1.5 rounded-[11px] px-4 py-[9px] text-[13px] font-semibold transition-all hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400'
												style={{
													color: mutedColor,
													border: `1px solid ${lineSoft}`,
													background: surface2,
													fontFamily: 'Space Grotesk, sans-serif',
												}}>
												<X size={13} strokeWidth={2.5} /> Decline
											</button>
											<button
												onClick={() => handleAcceptInvite(invite)}
												className='ws-btn-sheen flex cursor-pointer items-center gap-1.5 rounded-[11px] px-4 py-[9px] text-[13px] font-bold text-white transition-all hover:-translate-y-px'
												style={{
													border: '1px solid rgba(124,92,255,0.7)',
													background:
														'linear-gradient(180deg, #7c5cff, #9955ff)',
													boxShadow:
														'0 1px 0 rgba(255,255,255,0.3) inset, 0 6px 14px -8px rgba(128,80,255,0.9)',
													fontFamily: 'Space Grotesk, sans-serif',
												}}>
												<Check size={13} strokeWidth={3} /> Accept
											</button>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* WORKSPACES GRID */}
				<div>
					<div className='mb-5 flex items-center gap-3'>
						<span
							className='text-[12.5px] font-semibold tracking-[0.12em] uppercase'
							style={{ color: faintColor, fontFamily: 'Space Grotesk, sans-serif' }}>
							Available Workspaces · {filteredWorkspaces.length}
						</span>
						<div
							className='h-px flex-1'
							style={{
								background: `linear-gradient(90deg, ${lineSoft}, transparent)`,
							}}
						/>
					</div>

					{isLoading ? (
						<div
							className='flex flex-col items-center justify-center rounded-[22px] p-20'
							style={{ border: `1px solid ${lineSoft}`, background: surface }}>
							<Spinner color='primary' className='h-8 w-8 text-[#7c5cff]' />
							<span className='mt-3 text-sm font-bold' style={{ color: mutedColor }}>
								Loading workspaces...
							</span>
						</div>
					) : filteredWorkspaces.length === 0 && searchQuery ? (
						<div
							className='flex flex-col items-center justify-center rounded-[22px] p-20 text-center'
							style={{ border: `1px solid ${lineSoft}`, background: surface }}>
							<Search
								size={32}
								className='mb-3 opacity-40'
								style={{ color: faintColor }}
							/>
							<p className='text-sm font-semibold' style={{ color: mutedColor }}>
								No workspaces match "{searchQuery}"
							</p>
							<button
								onClick={() => setSearchQuery('')}
								className='mt-3 text-xs font-bold'
								style={{ color: '#7c5cff' }}>
								Clear search
							</button>
						</div>
					) : filteredWorkspaces.length === 0 ? null : (
						<div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
							<AnimatePresence>
								{filteredWorkspaces.map((wsp: IWorkspaceCard, i: number) => (
									<WorkspaceCard
										key={wsp.id}
										wsp={wsp}
										index={i}
										theme={theme}
										activeMenuId={activeMenuId}
										onSelect={handleSelectWorkspace}
										onMenuToggle={(id) => setActiveMenuId(id)}
										onRename={(w: IWorkspaceCard) => {
											setSelectedWorkspace(w);
											setRenameWspName(w.name);
											setIsRenameModalOpen(true);
										}}
										onDelete={handleDeleteWorkspace}
										onLeave={handleLeaveWorkspace}
										onInvite={(name) =>
											triggerToast(
												`Open members invite overlay for ${name}`,
												'info',
											)
										}
									/>
								))}
							</AnimatePresence>

							{/* Ghost "New Workspace" card */}
							<motion.div
								key='add-ws'
								whileHover={{ y: -6 }}
								onClick={() => setIsCreateModalOpen(true)}
								className='group relative cursor-pointer rounded-[22px]'>
								<div
									className='flex min-h-[280px] flex-col items-center justify-center rounded-[21px] border-2 border-dashed text-center transition-all'
									style={{
										borderColor: lineSoft,
										background: isDarkTheme ? bodyBg : '#f4f3fa',
									}}
									onMouseEnter={(e) => {
										const el = e.currentTarget as HTMLDivElement;
										el.style.borderColor = '#7c5cff';
										el.style.background = 'rgba(124,92,255,0.06)';
									}}
									onMouseLeave={(e) => {
										const el = e.currentTarget as HTMLDivElement;
										el.style.borderColor = lineSoft;
										el.style.background = isDarkTheme ? bodyBg : '#f4f3fa';
									}}>
									<div
										className='mb-[18px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px] text-white transition-all duration-300 group-hover:rotate-90'
										style={{
											background: 'linear-gradient(180deg, #7c5cff, #9955ff)',
											boxShadow:
												'0 1px 0 rgba(255,255,255,0.3) inset, 0 10px 24px -10px rgba(128,80,255,0.9)',
										}}>
										<Plus size={26} strokeWidth={2.4} />
									</div>
									<b
										className='text-[17px]'
										style={{
											fontFamily: 'Space Grotesk, sans-serif',
											color: textColor,
										}}>
										New Workspace
									</b>
									<small
										className='mt-1.5 block max-w-[200px] text-[13px]'
										style={{ color: faintColor }}>
										Spin up a fresh environment for your agents
									</small>
								</div>
							</motion.div>
						</div>
					)}
				</div>
			</main>

			{/* ── CREATE MODAL ── */}
			<AnimatePresence>
				{isCreateModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-[100] flex items-center justify-center p-4'
						style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
						onClick={closeCreateModal}>
						<motion.div
							initial={{ scale: 0.95, y: 15 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.95, y: 15 }}
							transition={{ duration: 0.2 }}
							className='relative w-full max-w-lg overflow-hidden rounded-[28px] p-8 shadow-2xl'
							style={{ background: surface, border: `1px solid ${lineSoft}` }}
							onClick={(e) => e.stopPropagation()}>
							<div
								className='pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full blur-2xl'
								style={{ background: 'rgba(124,92,255,0.08)' }}
							/>

							<button
								onClick={closeCreateModal}
								className='absolute top-6 right-6 cursor-pointer transition-colors'
								style={{ color: faintColor }}>
								<X size={18} />
							</button>

							<h3
								className='mb-6 flex items-center gap-2 text-lg font-bold'
								style={{
									color: textColor,
									fontFamily: 'Space Grotesk, sans-serif',
								}}>
								Create New Workspace
							</h3>

							<form onSubmit={handleCreateWorkspace} className='space-y-5'>
								<div>
									<ModalLabel faintColor={faintColor}>Workspace Name</ModalLabel>
									<input
										type='text'
										required
										aria-label='Workspace name'
										placeholder='e.g. Operations Department'
										value={newWspName}
										onChange={(e) => handleNameChange(e.target.value)}
										className='h-11 w-full rounded-xl px-4 text-xs font-semibold transition-all outline-none'
										style={{
											border: `1px solid ${lineSoft}`,
											background: surface2,
											color: textColor,
											fontFamily: 'Manrope, sans-serif',
										}}
									/>
								</div>

								<div>
									<ModalLabel faintColor={faintColor}>
										Workspace URL / Slug
									</ModalLabel>
									<div
										className='flex h-11 overflow-hidden rounded-xl transition-all'
										style={{
											border: `1px solid ${lineSoft}`,
											background: surface2,
										}}>
										<span
											className='flex h-full items-center border-r px-3 text-xs font-bold'
											style={{
												borderColor: lineSoft,
												background: isDarkTheme
													? 'rgba(0,0,0,0.2)'
													: 'rgba(100,95,160,0.07)',
												color: faintColor,
											}}>
											linkflow.icu/
										</span>
										<input
											type='text'
											required
											aria-label='Workspace URL slug'
											placeholder='my-workspace'
											value={newWspSlug}
											onChange={(e) => handleSlugChange(e.target.value)}
											className='min-w-0 flex-1 border-none bg-transparent px-3 text-xs font-semibold outline-none'
											style={{ color: textColor }}
										/>
									</div>
								</div>

								{/* Live preview */}
								<div
									className='rounded-2xl p-4'
									style={{
										border: `1px solid ${lineSoft}`,
										background: isDarkTheme ? bodyBg : '#f4f3fa',
									}}>
									<ModalLabel faintColor={faintColor}>Live Preview</ModalLabel>
									<div className='flex items-center gap-3'>
										<div
											className='flex h-11 w-11 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm'
											style={{
												background: `linear-gradient(135deg, ${selectedTheme.from}, ${selectedTheme.to})`,
											}}>
											{getInitials(newWspName.trim() || 'New Workspace')}
										</div>
										<div>
											<div
												className='text-xs leading-tight font-bold'
												style={{ color: textColor }}>
												{newWspName.trim() || 'Workspace Name'}
											</div>
											<div
												className='mt-0.5 text-[10px]'
												style={{ color: faintColor }}>
												Plan: {newWspTier}
											</div>
										</div>
									</div>
								</div>

								{/* Plan tier */}
								<div>
									<ModalLabel faintColor={faintColor}>
										Workspace Plan Tier
									</ModalLabel>
									<div className='grid grid-cols-3 gap-2.5'>
										{PLAN_TIERS.map((tier) => (
											<button
												key={tier.name}
												type='button'
												onClick={() => setNewWspTier(tier.name)}
												className='flex cursor-pointer flex-col items-start rounded-xl p-3 text-left transition-all duration-200'
												style={{
													border: `1px solid ${
														newWspTier === tier.name
															? tier.name === 'Enterprise'
																? 'rgba(59,130,246,0.5)'
																: tier.name === 'Pro'
																	? 'rgba(124,92,255,0.5)'
																	: lineSoft
															: lineSoft
													}`,
													background:
														newWspTier === tier.name
															? tier.name === 'Enterprise'
																? 'rgba(59,130,246,0.08)'
																: tier.name === 'Pro'
																	? 'rgba(124,92,255,0.08)'
																	: surface2
															: surface2,
												}}>
												<span
													className='text-xs font-bold tracking-wider uppercase'
													style={{ color: textColor }}>
													{tier.name}
												</span>
												<span
													className='mt-1 text-[10px] leading-normal font-semibold opacity-75'
													style={{ color: mutedColor }}>
													{tier.desc}
												</span>
											</button>
										))}
									</div>
								</div>

								{/* Theme picker */}
								<div>
									<ModalLabel faintColor={faintColor}>Choose Theme</ModalLabel>
									<div className='grid grid-cols-6 gap-2.5'>
										{THEME_OPTIONS.map((item, i) => (
											<button
												key={item.label}
												type='button'
												aria-label={item.label}
												onClick={() => setNewWspThemeIdx(i)}
												title={item.label}
												className={`h-10 w-full cursor-pointer rounded-xl border transition-transform duration-200 ${
													newWspThemeIdx === i
														? 'scale-105 border-transparent ring-2 ring-[#7c5cff] ring-offset-2'
														: 'border-transparent hover:scale-105'
												}`}
												style={{
													background: `linear-gradient(135deg, ${item.from}, ${item.to})`,
												}}
											/>
										))}
									</div>
								</div>

								<div className='flex items-center justify-end gap-2.5 pt-2'>
									<button
										type='button'
										onClick={closeCreateModal}
										className='cursor-pointer rounded-xl px-5 py-2.5 text-xs font-bold transition-colors'
										style={{ color: faintColor }}>
										Cancel
									</button>
									<button
										type='submit'
										disabled={createWorkspaceMutation.isPending}
										className='ws-btn-sheen cursor-pointer rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50'
										style={{
											background: 'linear-gradient(135deg, #7c5cff, #9955ff)',
											boxShadow:
												'0 1px 0 rgba(255,255,255,0.3) inset, 0 6px 14px -8px rgba(128,80,255,0.8)',
										}}>
										{createWorkspaceMutation.isPending
											? 'Creating...'
											: 'Create Workspace'}
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* ── RENAME MODAL ── */}
			<AnimatePresence>
				{isRenameModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-[100] flex items-center justify-center p-4'
						style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
						onClick={() => setIsRenameModalOpen(false)}>
						<motion.div
							initial={{ scale: 0.95, y: 15 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.95, y: 15 }}
							transition={{ duration: 0.2 }}
							className='relative w-full max-w-md overflow-hidden rounded-[28px] p-8 shadow-2xl'
							style={{ background: surface, border: `1px solid ${lineSoft}` }}
							onClick={(e) => e.stopPropagation()}>
							<button
								onClick={() => setIsRenameModalOpen(false)}
								className='absolute top-6 right-6 cursor-pointer transition-colors'
								style={{ color: faintColor }}>
								<X size={18} />
							</button>

							<h3
								className='mb-6 text-lg font-bold'
								style={{
									color: textColor,
									fontFamily: 'Space Grotesk, sans-serif',
								}}>
								Rename Workspace
							</h3>

							<form onSubmit={handleRenameWorkspace} className='space-y-5'>
								<div>
									<ModalLabel faintColor={faintColor}>Workspace Name</ModalLabel>
									<input
										type='text'
										required
										aria-label='New workspace name'
										placeholder='e.g. Sales Department'
										value={renameWspName}
										onChange={(e) => setRenameWspName(e.target.value)}
										className='h-11 w-full rounded-xl px-4 text-xs font-semibold transition-all outline-none'
										style={{
											border: `1px solid ${lineSoft}`,
											background: surface2,
											color: textColor,
										}}
									/>
								</div>

								{selectedWorkspace && (
									<div
										className='rounded-2xl p-4'
										style={{
											border: `1px solid ${lineSoft}`,
											background: isDarkTheme ? bodyBg : '#f4f3fa',
										}}>
										<ModalLabel faintColor={faintColor}>
											Live Preview
										</ModalLabel>
										<div className='flex items-center gap-3'>
											<div
												className='flex h-11 w-11 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm'
												style={{
													background: `linear-gradient(135deg, ${selectedWorkspace.gradientFrom}, ${selectedWorkspace.gradientTo})`,
												}}>
												{getInitials(renameWspName.trim() || 'WS')}
											</div>
											<div>
												<div
													className='text-xs leading-tight font-bold'
													style={{ color: textColor }}>
													{renameWspName.trim() || 'Workspace Name'}
												</div>
												<div
													className='mt-0.5 text-[10px]'
													style={{ color: faintColor }}>
													Plan: {selectedWorkspace.tier}
												</div>
											</div>
										</div>
									</div>
								)}

								<div className='flex items-center justify-end gap-2.5 pt-2'>
									<button
										type='button'
										onClick={() => setIsRenameModalOpen(false)}
										className='cursor-pointer rounded-xl px-5 py-2.5 text-xs font-bold transition-colors'
										style={{ color: faintColor }}>
										Cancel
									</button>
									<button
										type='submit'
										disabled={updateWorkspaceMutation.isPending}
										className='ws-btn-sheen cursor-pointer rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50'
										style={{
											background: 'linear-gradient(135deg, #7c5cff, #9955ff)',
											boxShadow:
												'0 1px 0 rgba(255,255,255,0.3) inset, 0 6px 14px -8px rgba(128,80,255,0.8)',
										}}>
										{updateWorkspaceMutation.isPending ? 'Saving...' : 'Save'}
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

// ─── Shared small components ───────────────────────────────────────────────────
const StatCard = ({ theme, children }: { theme: Theme; children: React.ReactNode }) => (
	<div
		className='group relative overflow-hidden rounded-[22px] p-6 transition-all duration-300 hover:-translate-y-1'
		style={{
			border: `1px solid ${theme.lineSoft}`,
			background: theme.surface,
			boxShadow: theme.isDark
				? '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.8)'
				: '0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 30px -12px rgba(100,95,160,0.12)',
		}}>
		{children}
	</div>
);

const StatIcon = ({ theme, children }: { theme: Theme; children: React.ReactNode }) => (
	<div
		className='flex h-[42px] w-[42px] items-center justify-center rounded-[13px]'
		style={{ border: `1px solid ${theme.lineSoft}`, background: theme.surface2 }}>
		{children}
	</div>
);

const StatLabel = ({ theme, children }: { theme: Theme; children: React.ReactNode }) => (
	<span
		className='text-[11px] font-semibold tracking-[0.13em] uppercase'
		style={{ color: theme.faintColor, fontFamily: 'Space Grotesk, sans-serif' }}>
		{children}
	</span>
);

const StatNumber = ({ theme, children }: { theme: Theme; children: React.ReactNode }) => (
	<div
		className='mt-4 leading-none tracking-[-0.02em]'
		style={{
			fontFamily: 'Space Grotesk, sans-serif',
			fontSize: 42,
			fontWeight: 700,
			color: theme.textColor,
		}}>
		{children}
	</div>
);

const ModalLabel = ({
	faintColor,
	children,
}: {
	faintColor: string;
	children: React.ReactNode;
}) => (
	<label
		className='mb-2 block text-[10px] font-bold tracking-wider uppercase'
		style={{ color: faintColor }}>
		{children}
	</label>
);

const MetricCell = ({
	icon,
	label,
	value,
	theme,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	theme: Theme;
}) => (
	<div className='flex items-center gap-[11px]'>
		<div
			className='flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]'
			style={{
				border: `1px solid ${theme.lineSoft}`,
				background: theme.surface2,
				color: '#7c5cff',
			}}>
			{icon}
		</div>
		<div className='leading-tight'>
			<div
				className='text-[10px] font-semibold tracking-[0.08em] uppercase'
				style={{ color: theme.faintColor, fontFamily: 'Space Grotesk, sans-serif' }}>
				{label}
			</div>
			<div
				className='text-[15px] font-semibold'
				style={{ color: theme.textColor, fontFamily: 'Space Grotesk, sans-serif' }}>
				{value}
			</div>
		</div>
	</div>
);

// ─── Workspace Card ────────────────────────────────────────────────────────────
interface WorkspaceCardProps {
	wsp: IWorkspaceCard;
	index: number;
	theme: Theme;
	activeMenuId: string | null;
	onSelect: (id: string) => void;
	onMenuToggle: (id: string | null) => void;
	onRename: (wsp: IWorkspaceCard) => void;
	onDelete: (id: string, name: string) => void;
	onLeave: (id: string, name: string) => void;
	onInvite: (name: string) => void;
}

const WorkspaceCard = ({
	wsp,
	index,
	theme,
	activeMenuId,
	onSelect,
	onMenuToggle,
	onRename,
	onDelete,
	onLeave,
	onInvite,
}: WorkspaceCardProps) => {
	const { surface, surface2, bodyBg, lineSoft, textColor, mutedColor, faintColor, isDark } =
		theme;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.97 }}
			transition={{ duration: 0.3, delay: index * 0.06 }}
			whileHover={{ y: -6 }}
			onClick={() => onSelect(wsp.id)}
			className='group relative cursor-pointer rounded-[22px] p-px transition-all'
			style={{ background: `linear-gradient(160deg, ${lineSoft}, transparent 55%)` }}>
			{/* Hover glow */}
			<div
				className='pointer-events-none absolute inset-[-40%] rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]'
				style={{
					background: `radial-gradient(circle, ${wsp.accentColor}, transparent 60%)`,
					filter: 'blur(60px)',
				}}
			/>

			{/* Card inner */}
			<div
				className='relative h-full overflow-hidden rounded-[21px] p-[22px]'
				style={{
					background: surface,
					boxShadow: isDark
						? '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(0,0,0,0.8)'
						: '0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 30px -12px rgba(100,95,160,0.1)',
				}}>
				{/* Top accent bar */}
				<div
					className='absolute top-0 right-0 left-0 h-[3px] rounded-t-[21px]'
					style={{
						background: `linear-gradient(to right, ${wsp.gradientFrom}, ${wsp.gradientTo})`,
						opacity: 0.85,
					}}
				/>

				{/* Avatar + badge + kebab */}
				<div className='mt-1 flex items-start justify-between'>
					<div className='relative'>
						<div
							className='flex h-[50px] w-[50px] items-center justify-center rounded-[15px] text-[18px] font-bold text-white'
							style={{
								background: `linear-gradient(135deg, ${wsp.gradientFrom}, ${wsp.gradientTo})`,
								boxShadow: `0 8px 22px -8px ${wsp.accentColor}, 0 0 0 1px rgba(255,255,255,0.14) inset`,
								fontFamily: 'Space Grotesk, sans-serif',
							}}>
							{getInitials(wsp.name)}
						</div>
						{wsp.hasActiveRuns && (
							<span
								className='absolute -top-1 -right-1 h-[13px] w-[13px] rounded-full border-[2.5px] border-white bg-[#34d399]'
								style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }}
							/>
						)}
					</div>

					<div className='flex items-center gap-2'>
						<span
							className='inline-flex items-center gap-[5px] rounded-full px-[11px] py-[5px] text-[10px] font-bold tracking-[0.1em] uppercase'
							style={{
								color: '#7c5cff',
								border: '1px solid rgba(124,92,255,0.3)',
								background: 'rgba(124,92,255,0.1)',
								fontFamily: 'Space Grotesk, sans-serif',
							}}>
							<span
								className='inline-block h-[5px] w-[5px] rounded-full'
								style={{ background: '#7c5cff', boxShadow: '0 0 6px #7c5cff' }}
							/>
							{wsp.tier === 'Enterprise'
								? 'Enterprise'
								: wsp.tier === 'Pro'
									? 'Pro'
									: 'Standard'}
						</span>

						<div className='relative'>
							<button
								aria-label='Workspace options'
								onClick={(e) => {
									e.stopPropagation();
									onMenuToggle(activeMenuId === wsp.id ? null : wsp.id);
								}}
								className='flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[9px] transition-all'
								style={{ color: faintColor, border: '1px solid transparent' }}
								onMouseEnter={(e) => {
									const el = e.currentTarget as HTMLButtonElement;
									el.style.borderColor = lineSoft;
									el.style.background = surface2;
									el.style.color = textColor;
								}}
								onMouseLeave={(e) => {
									const el = e.currentTarget as HTMLButtonElement;
									el.style.borderColor = 'transparent';
									el.style.background = 'transparent';
									el.style.color = faintColor;
								}}>
								<MoreVertical size={15} />
							</button>

							<AnimatePresence>
								{activeMenuId === wsp.id && (
									<motion.div
										initial={{ opacity: 0, scale: 0.95, y: 5 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95, y: 5 }}
										className='absolute right-0 z-50 mt-1.5 w-36 overflow-hidden rounded-xl p-1 shadow-lg'
										style={{
											background: surface,
											border: `1px solid ${lineSoft}`,
										}}>
										<button
											onClick={() => {
												onMenuToggle(null);
												onRename(wsp);
											}}
											className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors'
											style={{ color: textColor }}
											onMouseEnter={(e) =>
												((
													e.currentTarget as HTMLButtonElement
												).style.background = surface2)
											}
											onMouseLeave={(e) =>
												((
													e.currentTarget as HTMLButtonElement
												).style.background = 'transparent')
											}>
											<Edit2 size={12} style={{ color: '#7c5cff' }} /> Rename
										</button>
										{wsp.role === 'Owner' ? (
											<button
												onClick={() => {
													onMenuToggle(null);
													onDelete(wsp.id, wsp.name);
												}}
												className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-rose-500/10'
												style={{ color: '#f43f5e' }}>
												<Trash2 size={12} /> Delete
											</button>
										) : (
											<button
												onClick={() => {
													onMenuToggle(null);
													onLeave(wsp.id, wsp.name);
												}}
												className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-rose-500/10'
												style={{ color: '#f43f5e' }}>
												<LogOut size={12} /> Leave
											</button>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				{/* Name & role */}
				<h3
					className='mt-[22px] mb-[6px] text-[21px] font-semibold tracking-[-0.01em] transition-colors group-hover:text-[#7c5cff]'
					style={{ color: textColor, fontFamily: 'Space Grotesk, sans-serif' }}>
					{wsp.name}
				</h3>
				<div className='text-[13px]' style={{ color: faintColor }}>
					Role:{' '}
					<span className='font-semibold' style={{ color: mutedColor }}>
						{wsp.role}
					</span>{' '}
					· {wsp.lastActive}
				</div>

				{/* Metrics */}
				<div
					className='my-[22px] grid grid-cols-2 gap-3 rounded-[14px] p-4'
					style={{
						border: `1px solid ${lineSoft}`,
						background: isDark ? bodyBg : '#f4f3fa',
					}}>
					<MetricCell
						icon={<Layers size={17} />}
						label='Active Flows'
						value={`${wsp.activeFlowsCount} flows`}
						theme={theme}
					/>
					<MetricCell
						icon={<Cpu size={17} />}
						label='Deployments'
						value={`${wsp.activeAgentsCount} agent${wsp.activeAgentsCount !== 1 ? 's' : ''}`}
						theme={theme}
					/>
				</div>

				{/* Footer */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center'>
						{wsp.members.map((member, idx) => (
							<motion.div
								whileHover={{ y: -2, zIndex: 10 }}
								key={idx}
								title={member.name}
								className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 text-[11px] font-bold text-white ${member.color}`}
								style={{ borderColor: surface, marginLeft: idx > 0 ? -8 : 0 }}>
								{member.initials}
							</motion.div>
						))}
						<button
							onClick={(e) => {
								e.stopPropagation();
								onInvite(wsp.name);
							}}
							className='flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-[1.5px] border-dashed transition-all hover:scale-110 hover:border-solid hover:border-transparent hover:bg-gradient-to-b hover:from-[#7c5cff] hover:to-[#9955ff] hover:text-white'
							style={{
								borderColor: lineSoft,
								background: surface2,
								color: faintColor,
								marginLeft: -8,
							}}>
							<UserPlus size={11} />
						</button>
					</div>

					<button
						className='flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-[14px] transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-b group-hover:from-[#7c5cff] group-hover:to-[#9955ff] group-hover:text-white'
						style={{
							border: `1px solid ${lineSoft}`,
							background: `linear-gradient(180deg, ${surface2}, ${surface})`,
							color: '#7c5cff',
							boxShadow: isDark
								? '0 1px 0 rgba(255,255,255,0.05) inset, 0 2px 6px -3px rgba(0,0,0,0.5)'
								: '0 1px 0 rgba(255,255,255,0.8) inset',
						}}>
						<ArrowRight
							size={18}
							strokeWidth={2.4}
							className='transition-transform duration-300 group-hover:translate-x-0.5'
						/>
					</button>
				</div>
			</div>
		</motion.div>
	);
};

export default WorkspacesPage;
