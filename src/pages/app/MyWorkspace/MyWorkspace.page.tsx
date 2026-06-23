import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ChevronDown,
	ChevronRight,
	Copy,
	Edit3,
	Folder,
	FolderPlus,
	GitMerge,
	MoreVertical,
	Play,
	Plus,
	Search,
	Star,
	Trash2,
	Workflow,
	X,
	Calendar,
	Clock,
} from 'lucide-react';
import pages from '@/Routes/pages';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Container from '@/components/layout/Container';
import { useWorkspaceContext } from '@/context/workspaceContext';
import {
	useFolders,
	useCreateFolder,
	useUpdateFolder,
	useDeleteFolder,
	useMoveWorkflows,
} from '@/api/modules/folders';
import {
	useWorkflows,
	useCreateWorkflow,
	useDeleteWorkflow,
	useDuplicateWorkflow,
	useToggleFavorite,
	useExecuteWorkflow,
} from '@/api/modules/workflows';
import { OutletContextType } from './_layouts/MyWorkspace.layout';

type TFolderView = {
	id: string;
	name: string;
	color: string;
};

type TWorkflowView = {
	id: string;
	title: string;
	description: string;
	folderId: string | null;
	isActive: boolean;
	isFavorite: boolean;
	lastEdited: string;
	lastRun: string;
	nodesCount: number;
	apps: string[];
};

const ROOT_FOLDER_ID = '__root__';

const FOLDER_COLOR_OPTIONS = [
	{ label: 'Indigo', value: 'bg-indigo-600' },
	{ label: 'Rose', value: 'bg-rose-500' },
	{ label: 'Violet', value: 'bg-violet-600' },
	{ label: 'Emerald', value: 'bg-emerald-600' },
	{ label: 'Amber', value: 'bg-amber-500' },
] as const;

const getInitials = (name: string) =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0))
		.join('')
		.toUpperCase() || 'MW';

const formatDate = (value: number | string | null | undefined) => {
	if (!value) return 'Never';
	const numericValue = typeof value === 'number' ? value : Number.NaN;
	const date =
		typeof value === 'number'
			? new Date(numericValue < 1_000_000_000_000 ? numericValue * 1000 : numericValue)
			: new Date(value);
	if (Number.isNaN(date.getTime())) return 'Never';
	return date.toLocaleDateString();
};

const getAppNames = (nodes: { type?: string }[] | undefined) => {
	const names = (nodes ?? [])
		.map((node) => node.type?.toLowerCase())
		.filter((type): type is string => Boolean(type));
	return Array.from(new Set(names)).slice(0, 4);
};

const AppBadge = ({ name }: { name: string }) => (
	<span className='text-violet-650 shadow-3xs rounded-full border border-violet-100/60 bg-violet-50/30 px-2.5 py-0.5 text-[10px] font-bold capitalize transition-all duration-200 hover:border-violet-200/50 hover:bg-violet-50 dark:border-zinc-800/80 dark:bg-zinc-800/20 dark:text-violet-400 dark:hover:bg-violet-950/20'>
		{name}
	</span>
);

const MyWorkspacePage = () => {
	const { setHeaderLeft } = useOutletContext<OutletContextType>();
	const navigate = useNavigate();
	const {
		workspaces,
		isWorkspacesLoading,
		activeWorkspace,
		activeWorkspaceId,
		isActiveWorkspaceLoading,
		role,
	} = useWorkspaceContext();

	const workspaceSummary = useMemo(
		() => workspaces.find((workspace) => workspace.id === activeWorkspaceId),
		[activeWorkspaceId, workspaces],
	);

	const workspaceName = activeWorkspace?.name ?? workspaceSummary?.name ?? 'My Workspace';
	const workspaceSlug = activeWorkspace?.slug ?? workspaceSummary?.slug;
	const workspaceRole = role ?? workspaceSummary?.role ?? null;
	const hasWorkspace = Boolean(activeWorkspaceId);

	const { data: apiFolders = [], isLoading: isFoldersLoading } = useFolders(activeWorkspaceId);
	const { data: apiWorkflowsResponse, isLoading: isWorkflowsLoading } =
		useWorkflows(activeWorkspaceId);

	const createFolderMutation = useCreateFolder(activeWorkspaceId);
	const updateFolderMutation = useUpdateFolder(activeWorkspaceId);
	const deleteFolderMutation = useDeleteFolder(activeWorkspaceId);
	const moveWorkflowsMutation = useMoveWorkflows(activeWorkspaceId);
	const createWorkflowMutation = useCreateWorkflow(activeWorkspaceId);
	const deleteWorkflowMutation = useDeleteWorkflow(activeWorkspaceId);
	const duplicateWorkflowMutation = useDuplicateWorkflow(activeWorkspaceId);
	const toggleFavoriteMutation = useToggleFavorite(activeWorkspaceId);
	const executeWorkflowMutation = useExecuteWorkflow(activeWorkspaceId);

	const folders = useMemo<TFolderView[]>(
		() =>
			apiFolders.map((folder) => ({
				id: folder.id,
				name: folder.name,
				color: folder.color || 'bg-indigo-600',
			})),
		[apiFolders],
	);

	const workflows = useMemo<TWorkflowView[]>(() => {
		const data = apiWorkflowsResponse?.data ?? [];
		return data.map((workflow) => ({
			id: workflow.id,
			title: workflow.name,
			description: workflow.description || 'No description provided.',
			folderId: workflow.folder_id || null,
			isActive: Boolean(workflow.is_active),
			isFavorite: Boolean(workflow.is_favorite),
			lastEdited: formatDate(workflow.updated_at),
			lastRun: formatDate(workflow.last_executed_at),
			nodesCount: workflow.nodes?.length ?? 0,
			apps: getAppNames(workflow.nodes),
		}));
	}, [apiWorkflowsResponse]);

	const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
	const [searchQuery, setSearchQuery] = useState('');
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
	const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
	const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false);
	const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
	const [editingFolder, setEditingFolder] = useState<TFolderView | null>(null);
	const [folderName, setFolderName] = useState('');
	const [folderColor, setFolderColor] = useState('bg-indigo-600');
	const [workflowName, setWorkflowName] = useState('');
	const [workflowDescription, setWorkflowDescription] = useState('');
	const [workflowFolderId, setWorkflowFolderId] = useState('');

	const didInitExpand = useRef(false);
	useEffect(() => {
		if (didInitExpand.current || folders.length === 0) return;
		setExpandedFolders(
			folders.reduce<Record<string, boolean>>((acc, folder, index) => {
				acc[folder.id] = index === 0;
				return acc;
			}, {}),
		);
		didInitExpand.current = true;
	}, [folders]);

	useEffect(() => {
		setHeaderLeft(
			<Breadcrumb list={[{ to: pages.app.subPages.myWorkspace.to, text: workspaceName }]} />,
		);
		return () => setHeaderLeft(undefined);
	}, [setHeaderLeft, workspaceName]);

	useEffect(() => {
		const closeMenu = () => setActiveMenuId(null);
		window.addEventListener('click', closeMenu);
		return () => window.removeEventListener('click', closeMenu);
	}, []);

	const filteredWorkflows = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		return workflows.filter((workflow) => {
			if (showFavoritesOnly && !workflow.isFavorite) return false;
			if (!query) return true;
			return (
				workflow.title.toLowerCase().includes(query) ||
				workflow.description.toLowerCase().includes(query)
			);
		});
	}, [searchQuery, showFavoritesOnly, workflows]);

	const groupedWorkflows = useMemo(() => {
		const groups: Record<string, TWorkflowView[]> = { [ROOT_FOLDER_ID]: [] };
		folders.forEach((folder) => {
			groups[folder.id] = [];
		});
		filteredWorkflows.forEach((workflow) => {
			const groupId =
				workflow.folderId && groups[workflow.folderId] ? workflow.folderId : ROOT_FOLDER_ID;
			groups[groupId].push(workflow);
		});
		return groups;
	}, [filteredWorkflows, folders]);

	const workflowGroups = useMemo(() => {
		const rootGroup =
			groupedWorkflows[ROOT_FOLDER_ID].length > 0
				? [{ id: ROOT_FOLDER_ID, name: 'Workflows without folders', color: 'bg-slate-600' }]
				: [];
		return [...rootGroup, ...folders];
	}, [folders, groupedWorkflows]);

	const activeWorkflowCount = workflows.filter((workflow) => workflow.isActive).length;
	const favoriteWorkflowCount = workflows.filter((workflow) => workflow.isFavorite).length;
	const isLoading =
		isWorkspacesLoading || isActiveWorkspaceLoading || isFoldersLoading || isWorkflowsLoading;

	const toggleFolder = (folderId: string) => {
		setExpandedFolders((current) => ({ ...current, [folderId]: !current[folderId] }));
	};

	const resetFolderForm = () => {
		setEditingFolder(null);
		setFolderName('');
		setFolderColor('bg-indigo-600');
	};

	const openCreateFolder = () => {
		resetFolderForm();
		setIsFolderModalOpen(true);
	};

	const openEditFolder = (folder: TFolderView) => {
		setEditingFolder(folder);
		setFolderName(folder.name);
		setFolderColor(folder.color);
		setIsFolderModalOpen(true);
	};

	const closeFolderModal = () => {
		setIsFolderModalOpen(false);
		resetFolderForm();
	};

	const handleSaveFolder = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!folderName.trim() || !hasWorkspace) return;

		if (editingFolder) {
			await updateFolderMutation.mutateAsync({
				id: editingFolder.id,
				body: { name: folderName.trim(), color: folderColor },
			});
		} else {
			const folder = await createFolderMutation.mutateAsync({
				name: folderName.trim(),
				color: folderColor,
			});
			setExpandedFolders((current) => ({ ...current, [folder.id]: true }));
		}
		closeFolderModal();
	};

	const handleDeleteFolder = async (folder: TFolderView) => {
		const confirmed = window.confirm(
			`Delete folder "${folder.name}"? Workflows inside it will move back to root level.`,
		);
		if (!confirmed) return;
		await deleteFolderMutation.mutateAsync(folder.id);
	};

	const handleCreateWorkflow = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!workflowName.trim() || !hasWorkspace) return;

		const workflow = await createWorkflowMutation.mutateAsync({
			name: workflowName.trim(),
			description: workflowDescription.trim() || undefined,
			folder_id: workflowFolderId || undefined,
			nodes: [],
			connections: [],
		});
		if (workflowFolderId) {
			setExpandedFolders((current) => ({ ...current, [workflowFolderId]: true }));
		}
		setWorkflowName('');
		setWorkflowDescription('');
		setWorkflowFolderId('');
		setIsCreateWorkflowOpen(false);
		navigate(`${pages.editor.subPages.editWorkflow.to}/${activeWorkspaceId}/${workflow.id}`);
	};

	const handleMoveWorkflow = async (workflow: TWorkflowView, folderId: string | null) => {
		setActiveMenuId(null);
		await moveWorkflowsMutation.mutateAsync({
			workflow_ids: [workflow.id],
			folder_id: folderId,
		});
		if (folderId) {
			setExpandedFolders((current) => ({ ...current, [folderId]: true }));
		}
	};

	const handleDuplicateWorkflow = async (workflow: TWorkflowView) => {
		setActiveMenuId(null);
		await duplicateWorkflowMutation.mutateAsync({
			id: workflow.id,
			body: { name: `${workflow.title} (Copy)` },
		});
	};

	const handleDeleteWorkflow = async (workflow: TWorkflowView) => {
		setActiveMenuId(null);
		const confirmed = window.confirm(`Delete workflow "${workflow.title}"?`);
		if (!confirmed) return;
		await deleteWorkflowMutation.mutateAsync(workflow.id);
	};

	const handleRunWorkflow = async (workflow: TWorkflowView) => {
		setActiveMenuId(null);
		await executeWorkflowMutation.mutateAsync({ id: workflow.id });
	};

	const handleToggleFavorite = async (workflow: TWorkflowView, event: React.MouseEvent) => {
		event.stopPropagation();
		await toggleFavoriteMutation.mutateAsync({
			id: workflow.id,
			is_favorite: !workflow.isFavorite,
		});
	};

	const renderMoveMenu = (workflow: TWorkflowView) => {
		const destinations = folders.filter((folder) => folder.id !== workflow.folderId);
		if (!workflow.folderId && destinations.length === 0) return null;

		return (
			<div className='my-1 border-y border-slate-100 py-1 dark:border-zinc-800'>
				<div className='px-3 py-1 text-[9px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
					Move to
				</div>
				{workflow.folderId && (
					<button
						type='button'
						onClick={() => handleMoveWorkflow(workflow, null)}
						className='flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800'>
						<Workflow size={12} className='text-violet-500' />
						Root level
					</button>
				)}
				{destinations.map((folder) => (
					<button
						key={folder.id}
						type='button'
						onClick={() => handleMoveWorkflow(workflow, folder.id)}
						className='flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800'>
						<Folder size={12} className='text-slate-400' />
						{folder.name}
					</button>
				))}
			</div>
		);
	};

	const renderWorkflowCard = (workflow: TWorkflowView) => (
		<div
			key={workflow.id}
			role='link'
			tabIndex={0}
			aria-label={`Open workflow ${workflow.title}`}
			onClick={() =>
				navigate(
					`${pages.editor.subPages.editWorkflow.to}/${activeWorkspaceId}/${workflow.id}`,
				)
			}
			onKeyDown={(event) => {
				if (event.key === 'Enter') {
					navigate(
						`${pages.editor.subPages.editWorkflow.to}/${activeWorkspaceId}/${workflow.id}`,
					);
				}
			}}
			className='group relative flex min-h-[220px] cursor-pointer flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/70 p-5.5 shadow-2xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/40 hover:bg-white hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:hover:border-violet-500/30 dark:hover:bg-zinc-900/90'>
			{/* Bottom interactive gradient line */}
			<div className='absolute right-0 bottom-0 left-0 h-1.5 rounded-b-2xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-10' />

			<div className='flex flex-col gap-3.5'>
				<div className='flex items-start justify-between gap-3'>
					<div className='flex min-w-0 items-center gap-3.5'>
						<div
							className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
								workflow.isActive
									? 'text-violet-650 shadow-3xs border-violet-500/20 bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 group-hover:scale-105 dark:border-violet-500/30 dark:bg-violet-500/20 dark:text-violet-400'
									: 'border-slate-200/60 bg-slate-50/80 text-slate-500 group-hover:scale-105 dark:border-zinc-700/50 dark:bg-zinc-800/80 dark:text-zinc-400'
							}`}>
							<Workflow size={18} />
						</div>
						<div className='min-w-0'>
							<div className='flex flex-wrap items-center gap-2'>
								<h3 className='truncate text-sm font-black tracking-wide text-slate-900 transition-colors duration-200 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400'>
									{workflow.title}
								</h3>
								<span
									className={`shadow-3xs flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider capitalize ${
										workflow.isActive
											? 'border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
											: 'border-slate-200/30 bg-slate-100/80 text-slate-500 dark:border-zinc-700/30 dark:bg-zinc-800/80 dark:text-zinc-400'
									}`}>
									{workflow.isActive && (
										<span className='relative flex h-1.5 w-1.5'>
											<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
											<span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500'></span>
										</span>
									)}
									{workflow.isActive ? 'active' : 'inactive'}
								</span>
							</div>
							<p className='dark:text-zinc-550 mt-1 line-clamp-1 text-[10px] font-bold text-slate-400'>
								Created workspace workflow
							</p>
						</div>
					</div>

					<div className='relative z-25 flex shrink-0 items-center gap-1'>
						<motion.button
							type='button'
							whileHover={{ scale: 1.15 }}
							whileTap={{ scale: 0.9 }}
							aria-label={`${workflow.isFavorite ? 'Remove' : 'Add'} ${workflow.title} ${workflow.isFavorite ? 'from' : 'to'} favorites`}
							onClick={(event) => handleToggleFavorite(workflow, event)}
							className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors ${
								workflow.isFavorite
									? 'text-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
									: 'dark:text-zinc-550 text-slate-300 hover:bg-slate-100/80 hover:text-slate-500 dark:hover:bg-zinc-800'
							}`}>
							<Star
								size={15}
								className={workflow.isFavorite ? 'fill-amber-500' : ''}
							/>
						</motion.button>
						<div className='relative'>
							<button
								type='button'
								aria-label={`Open actions for ${workflow.title}`}
								onClick={(event) => {
									event.stopPropagation();
									setActiveMenuId(
										activeMenuId === workflow.id ? null : workflow.id,
									);
								}}
								className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 ${
									activeMenuId === workflow.id
										? 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-white'
										: ''
								}`}>
								<MoreVertical size={16} />
							</button>
							<AnimatePresence>
								{activeMenuId === workflow.id && (
									<motion.div
										initial={{ opacity: 0, scale: 0.95, y: 5 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95, y: 5 }}
										onClick={(event) => event.stopPropagation()}
										className='absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 text-left shadow-2xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/95'>
										<button
											type='button'
											onClick={() => handleRunWorkflow(workflow)}
											className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800'>
											<Play
												size={12}
												className='fill-emerald-500/10 text-emerald-500'
											/>
											Run now
										</button>
										<button
											type='button'
											onClick={() =>
												navigate(
													`${pages.editor.subPages.editWorkflow.to}/${activeWorkspaceId}/${workflow.id}`,
												)
											}
											className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800'>
											<Edit3 size={12} className='text-violet-500' />
											Open editor
										</button>
										{renderMoveMenu(workflow)}
										<button
											type='button'
											onClick={() => handleDuplicateWorkflow(workflow)}
											className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800'>
											<Copy size={12} className='text-blue-500' />
											Duplicate
										</button>
										<button
											type='button'
											onClick={() => handleDeleteWorkflow(workflow)}
											className='flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'>
											<Trash2 size={12} />
											Delete
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				<div className='flex flex-col gap-2 pl-0.5'>
					<p className='line-clamp-2 min-h-[32px] text-xs leading-relaxed font-semibold text-slate-500 dark:text-zinc-400'>
						{workflow.description}
					</p>

					<div className='mt-1 flex flex-wrap gap-1.5'>
						{workflow.apps.length > 0 ? (
							workflow.apps.map((app) => <AppBadge key={app} name={app} />)
						) : (
							<span className='shadow-3xs inline-flex items-center gap-1.5 rounded-full border border-amber-200/50 bg-amber-50/20 px-2.5 py-0.5 text-[9px] font-bold text-amber-700 dark:border-amber-500/10 dark:bg-amber-500/5 dark:text-amber-400'>
								<span className='h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500' />
								Empty Workflow
							</span>
						)}
					</div>
				</div>
			</div>

			<div className='mt-5 flex items-center justify-between gap-3 border-t border-slate-100/80 pt-4 dark:border-zinc-800/80'>
				<div className='dark:text-zinc-550 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400'>
					<div className='flex items-center gap-1.5 truncate'>
						<Calendar size={12} className='dark:text-zinc-650 text-slate-400/80' />
						<span>Updated {workflow.lastEdited}</span>
					</div>
					<div className='flex items-center gap-1.5 truncate'>
						<Clock size={12} className='dark:text-zinc-650 text-slate-400/80' />
						<span>Run {workflow.lastRun}</span>
					</div>
				</div>
				<span className='text-violet-650 shadow-3xs flex shrink-0 items-center gap-1.5 rounded-full border border-violet-100/50 bg-violet-50/80 px-2.5 py-1 text-[10px] font-black dark:border-violet-900/30 dark:bg-violet-950/20 dark:text-violet-400'>
					<GitMerge size={11} className='rotate-90 text-violet-500' />
					<span>
						{workflow.nodesCount} {workflow.nodesCount === 1 ? 'node' : 'nodes'}
					</span>
				</span>
			</div>
		</div>
	);

	return (
		<Container className='relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#f8f9fc] !p-0 dark:bg-zinc-950'>
			{/* Decorative background glow circles */}
			<div className='pointer-events-none absolute top-[-10%] left-[-10%] h-[35rem] w-[35rem] rounded-full bg-violet-200/30 blur-[120px] dark:bg-violet-900/5' />
			<div className='pointer-events-none absolute right-[-10%] bottom-[-10%] h-[35rem] w-[35rem] rounded-full bg-indigo-200/20 blur-[120px] dark:bg-indigo-900/5' />

			<div className='relative z-10 mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 md:p-8'>
				<header className='relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md lg:flex-row lg:items-center dark:border-zinc-800/80 dark:bg-zinc-900/40'>
					{/* Banner background glow effect */}
					<div className='absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl' />
					<div className='absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl' />

					{/* Faint network nodes artwork on the right */}
					<div className='pointer-events-none absolute top-0 right-0 bottom-0 hidden w-64 overflow-hidden opacity-20 md:block dark:opacity-5'>
						<svg
							className='h-full w-full text-violet-500'
							viewBox='0 0 200 100'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<circle
								cx='150'
								cy='30'
								r='6'
								stroke='currentColor'
								strokeWidth='1.5'
							/>
							<circle
								cx='100'
								cy='60'
								r='6'
								stroke='currentColor'
								strokeWidth='1.5'
							/>
							<circle
								cx='170'
								cy='75'
								r='6'
								stroke='currentColor'
								strokeWidth='1.5'
							/>
							<path
								d='M106 60 L144 30 M156 30 L164 70 M106 60 L164 75'
								stroke='currentColor'
								strokeWidth='1'
								strokeDasharray='2 2'
							/>
						</svg>
					</div>

					<div className='relative z-10 flex min-w-0 items-center gap-4.5'>
						<div className='group relative shrink-0'>
							{/* Circular initials avatar with soft glow */}
							<div className='shadow-violet-650/30 relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-lg font-black text-white shadow-lg'>
								{getInitials(workspaceName)}
							</div>
							{/* Green status indicator dot at the bottom left */}
							<span className='absolute bottom-0 left-0 flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm dark:border-zinc-950' />
						</div>
						<div className='min-w-0'>
							<div className='flex flex-wrap items-center gap-2.5'>
								<h1 className='truncate text-2xl font-black tracking-tight text-slate-900 dark:text-white'>
									{workspaceName}
								</h1>
								{workspaceRole && (
									<span className='rounded-full border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-violet-600 uppercase shadow-2xs dark:border-violet-900/30 dark:bg-violet-950/20 dark:text-violet-400'>
										{workspaceRole}
									</span>
								)}
							</div>
							<p className='mt-1 max-w-xl text-xs leading-relaxed font-semibold text-slate-500 dark:text-zinc-400'>
								{workspaceSlug ? `@${workspaceSlug} • ` : ''}Manage workspace
								workflows, logic rules, automation triggers, and organize them into
								folders.
							</p>
						</div>
					</div>

					<div className='relative z-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
						<motion.button
							type='button'
							whileHover={{ scale: 1.02, y: -1 }}
							whileTap={{ scale: 0.98 }}
							onClick={openCreateFolder}
							disabled={!hasWorkspace}
							className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700/80 dark:hover:bg-zinc-800/80'>
							<FolderPlus size={14} className='text-amber-500' />
							New Folder
						</motion.button>
						<motion.button
							type='button'
							whileHover={{ scale: 1.02, y: -1 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => setIsCreateWorkflowOpen(true)}
							disabled={!hasWorkspace}
							className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60'>
							<Plus size={15} strokeWidth={2.5} />
							New Workflow
						</motion.button>
					</div>
				</header>

				<section className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
					{[
						{
							label: 'Workflows',
							value: workflows.length,
							desc: 'Total integrations',
							icon: Workflow,
							color: 'text-violet-600 dark:text-violet-400',
							bgColor: 'bg-violet-50 dark:bg-violet-950/30',
							borderColor:
								'hover:border-violet-500/30 dark:hover:border-violet-500/20',
							shadowColor: 'hover:shadow-violet-500/10',
							accentColor: 'from-violet-500 to-indigo-500',
						},
						{
							label: 'Active',
							value: activeWorkflowCount,
							desc: 'Running processes',
							icon: Play,
							color: 'text-emerald-600 dark:text-emerald-400',
							bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
							borderColor:
								'hover:border-emerald-500/30 dark:hover:border-emerald-500/20',
							shadowColor: 'hover:shadow-emerald-500/10',
							accentColor: 'from-emerald-500 to-teal-500',
						},
						{
							label: 'Folders',
							value: folders.length,
							desc: 'Organized groups',
							icon: Folder,
							color: 'text-amber-600 dark:text-amber-400',
							bgColor: 'bg-amber-50 dark:bg-amber-950/30',
							borderColor: 'hover:border-amber-500/30 dark:hover:border-amber-500/20',
							shadowColor: 'hover:shadow-amber-500/10',
							accentColor: 'from-amber-500 to-orange-500',
						},
						{
							label: 'Favorites',
							value: favoriteWorkflowCount,
							desc: 'Starred items',
							icon: Star,
							color: 'text-rose-600 dark:text-rose-400',
							bgColor: 'bg-rose-50 dark:bg-rose-950/30',
							borderColor: 'hover:border-rose-500/30 dark:hover:border-rose-500/20',
							shadowColor: 'hover:shadow-rose-500/10',
							accentColor: 'from-rose-500 to-pink-500',
						},
					].map((stat) => {
						const IconComponent = stat.icon;
						return (
							<motion.div
								key={stat.label}
								whileHover={{ y: -6, scale: 1.02 }}
								transition={{ type: 'spring', stiffness: 400, damping: 25 }}
								className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-xs backdrop-blur-md transition-all duration-300 dark:border-zinc-800/80 dark:bg-zinc-900/60 ${stat.borderColor} ${stat.shadowColor} group hover:shadow-md`}>
								{/* Hover Card Glow Overlay */}
								<div
									className={`absolute inset-0 -z-10 bg-gradient-to-br ${stat.accentColor} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.02] dark:group-hover:opacity-[0.04]`}
								/>

								<div
									className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bgColor} ${stat.color} shadow-2xs transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
									<IconComponent
										size={19}
										className={
											stat.label === 'Active'
												? 'fill-emerald-500/10'
												: stat.label === 'Favorites'
													? 'fill-rose-500/10'
													: ''
										}
									/>
								</div>

								<div>
									<div className='text-slate-455 text-[10px] font-black tracking-wider uppercase dark:text-zinc-500'>
										{stat.label}
									</div>
									<div className='mt-0.5 text-3xl font-black tracking-tight text-slate-900 dark:text-white'>
										{stat.value}
									</div>
									<div className='dark:text-zinc-550 mt-0.5 text-[10px] font-semibold text-slate-400'>
										{stat.desc}
									</div>
								</div>
							</motion.div>
						);
					})}
				</section>

				<section className='flex flex-col gap-3 border-t border-slate-200/60 pt-5 lg:flex-row lg:items-center lg:justify-between dark:border-zinc-800/80'>
					<div className='relative flex items-center rounded-xl border border-slate-200/60 bg-slate-100/60 p-1.5 shadow-2xs backdrop-blur-xs dark:border-zinc-800/60 dark:bg-zinc-900/60'>
						<button
							type='button'
							onClick={() => setShowFavoritesOnly(false)}
							className={`relative z-10 cursor-pointer rounded-lg px-4.5 py-1.5 text-xs font-bold transition-colors duration-300 ${!showFavoritesOnly ? 'shadow-3xs text-violet-600 dark:text-violet-400' : 'dark:text-zinc-450 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'}`}>
							{!showFavoritesOnly && (
								<motion.div
									layoutId='activeTabBackground'
									className='absolute inset-0 z-[-1] rounded-lg border border-slate-200/40 bg-white dark:border-zinc-700/30 dark:bg-zinc-800'
									transition={{ type: 'spring', stiffness: 380, damping: 30 }}
								/>
							)}
							All Workflows
						</button>
						<button
							type='button'
							onClick={() => setShowFavoritesOnly(true)}
							className={`relative z-10 cursor-pointer rounded-lg px-4.5 py-1.5 text-xs font-bold transition-colors duration-300 ${showFavoritesOnly ? 'shadow-3xs text-violet-600 dark:text-violet-400' : 'dark:text-zinc-455 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'}`}>
							{showFavoritesOnly && (
								<motion.div
									layoutId='activeTabBackground'
									className='absolute inset-0 z-[-1] rounded-lg border border-slate-200/40 bg-white dark:border-zinc-700/30 dark:bg-zinc-800'
									transition={{ type: 'spring', stiffness: 380, damping: 30 }}
								/>
							)}
							Starred Favorites
						</button>
					</div>

					<div className='group relative w-full sm:w-80'>
						<Search className='absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-violet-500 dark:text-zinc-500' />
						<input
							aria-label='Search workspace workflows'
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder='Search workflows by title or description...'
							className='dark:placeholder-zinc-550 h-10 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-10 text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition-all outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white'
						/>
						{searchQuery && (
							<button
								type='button'
								aria-label='Clear search'
								onClick={() => setSearchQuery('')}
								className='absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300'>
								<X size={14} />
							</button>
						)}
					</div>
				</section>

				{!hasWorkspace ? (
					<div className='dark:border-zinc-750 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500 dark:bg-zinc-900 dark:text-zinc-400'>
						Select or create a workspace to manage workflows.
					</div>
				) : isLoading ? (
					<div className='rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'>
						Loading workspace...
					</div>
				) : workflows.length === 0 ? (
					<div className='shadow-3xs rounded-3xl border border-dashed border-slate-200/80 bg-white/40 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900'>
						<div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100/80 text-violet-600 shadow-sm dark:bg-violet-500/10 dark:text-violet-400'>
							<GitMerge size={22} className='rotate-90' />
						</div>
						<h2 className='mt-4 text-lg font-black text-slate-900 dark:text-white'>
							No workflows yet
						</h2>
						<p className='text-slate-550 dark:text-zinc-405 mx-auto mt-1 max-w-sm text-xs leading-relaxed font-semibold'>
							Create your first workflow for this workspace. New workflows can be
							assigned to a folder immediately.
						</p>
						<motion.button
							type='button'
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => setIsCreateWorkflowOpen(true)}
							className='mt-5 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg'>
							<Plus size={15} strokeWidth={2.5} />
							Create Workflow
						</motion.button>
					</div>
				) : filteredWorkflows.length === 0 ? (
					<div className='rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'>
						No workflows match your current search or filter.
					</div>
				) : (
					<div className='space-y-4'>
						{workflowGroups.map((folder) => {
							const workflowsInFolder = groupedWorkflows[folder.id] ?? [];
							const isRootGroup = folder.id === ROOT_FOLDER_ID;
							const isExpanded = isRootGroup || Boolean(expandedFolders[folder.id]);

							return (
								<section key={folder.id} className='space-y-3'>
									{isRootGroup ? (
										<div className='shadow-3xs flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/10 px-5 py-4 backdrop-blur-md transition-all duration-300 hover:bg-indigo-50/20 dark:border-indigo-900/20 dark:bg-indigo-950/5 dark:hover:bg-indigo-950/10'>
											<div className='flex min-w-0 items-center gap-3'>
												<div className='text-indigo-650 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 shadow-2xs dark:bg-indigo-500/10 dark:text-indigo-400'>
													<Workflow size={17} />
												</div>
												<div className='min-w-0'>
													<h2 className='text-xs font-extrabold text-slate-800 dark:text-zinc-200'>
														Workflows without folders
													</h2>
													<p className='mt-0.5 hidden text-[10px] font-semibold text-slate-400 sm:block dark:text-zinc-500'>
														Direct workflows configured at the workspace
														level.
													</p>
												</div>
											</div>
											<span className='shrink-0 rounded-full border border-indigo-200/30 bg-indigo-100 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:border-indigo-800/20 dark:bg-indigo-950/40 dark:text-indigo-300'>
												{workflowsInFolder.length}
											</span>
										</div>
									) : (
										<div className='group/folder relative flex items-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-2xs backdrop-blur-md transition-all duration-300 hover:border-violet-500/25 hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:hover:border-violet-500/20 dark:hover:bg-zinc-900/80'>
											<div
												className={`absolute top-0 bottom-0 left-0 w-1.5 ${folder.color} opacity-85`}
											/>

											<button
												type='button'
												aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${folder.name}`}
												onClick={() => toggleFolder(folder.id)}
												className='group/btn flex min-w-0 flex-1 cursor-pointer items-center justify-between py-4 pr-3.5 pl-6 text-left'>
												<div className='flex min-w-0 items-center gap-3.5'>
													<span className='dark:text-zinc-550 text-slate-400 transition-transform duration-300 group-hover/btn:translate-x-0.5'>
														{isExpanded ? (
															<ChevronDown
																size={14}
																strokeWidth={2.5}
															/>
														) : (
															<ChevronRight
																size={14}
																strokeWidth={2.5}
															/>
														)}
													</span>
													<div
														className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${folder.color} text-white shadow-sm shadow-black/10`}>
														<Folder
															size={16}
															className='fill-white/10'
														/>
													</div>
													<span className='truncate text-xs font-bold tracking-wide text-slate-800 dark:text-zinc-200'>
														{folder.name}
													</span>
												</div>
												<span className='shadow-3xs shrink-0 rounded-full border border-slate-200/20 bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-500 dark:border-zinc-700/20 dark:bg-zinc-800/80 dark:text-zinc-400'>
													{workflowsInFolder.length}
												</span>
											</button>
											<div className='mr-4 flex shrink-0 items-center gap-1.5 transition-all duration-300'>
												<button
													type='button'
													aria-label={`Edit ${folder.name}`}
													onClick={() => openEditFolder(folder)}
													className='dark:text-zinc-550 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-violet-600 dark:hover:bg-zinc-800 dark:hover:text-violet-400'>
													<Edit3 size={13} />
												</button>
												<button
													type='button'
													aria-label={`Delete ${folder.name}`}
													onClick={() => handleDeleteFolder(folder)}
													className='dark:text-zinc-550 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-zinc-800 dark:hover:text-rose-400'>
													<Trash2 size={13} />
												</button>
											</div>
										</div>
									)}

									<AnimatePresence initial={false}>
										{isExpanded && (
											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: 'auto', opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.2 }}
												className='overflow-visible'>
												{workflowsInFolder.length === 0 ? (
													<div className='rounded-2xl border border-dashed border-slate-200/60 bg-white/40 p-8 text-center text-sm font-semibold text-slate-400 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-500'>
														No workflows match this folder and filter.
													</div>
												) : (
													<div className='grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 xl:grid-cols-3'>
														{workflowsInFolder.map(renderWorkflowCard)}
													</div>
												)}
											</motion.div>
										)}
									</AnimatePresence>
								</section>
							);
						})}
					</div>
				)}
			</div>

			<AnimatePresence>
				{isCreateWorkflowOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 font-sans backdrop-blur-sm dark:bg-black/60'
						onClick={() => setIsCreateWorkflowOpen(false)}>
						<motion.div
							initial={{ scale: 0.95, y: 15 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.95, y: 15 }}
							transition={{ duration: 0.2 }}
							className='relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-zinc-700 dark:bg-zinc-900'
							onClick={(event) => event.stopPropagation()}>
							<button
								type='button'
								aria-label='Close create workflow dialog'
								onClick={() => setIsCreateWorkflowOpen(false)}
								className='absolute top-4 right-4 text-slate-400 transition hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300'>
								<X size={18} />
							</button>
							<h3 className='mb-5 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white'>
								<GitMerge className='h-5 w-5 rotate-90 text-violet-600' />
								Create Workflow
							</h3>
							<form onSubmit={handleCreateWorkflow} className='space-y-4'>
								<div>
									<label
										htmlFor='workspace-workflow-name'
										className='mb-1.5 block text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
										Workflow Name
									</label>
									<input
										id='workspace-workflow-name'
										aria-label='Workflow name'
										required
										value={workflowName}
										onChange={(event) => setWorkflowName(event.target.value)}
										placeholder='e.g. Lead sync manager'
										className='dark:border-zinc-750 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-950 transition outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:bg-zinc-900 dark:text-white'
									/>
								</div>
								<div>
									<label
										htmlFor='workspace-workflow-description'
										className='mb-1.5 block text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
										Description
									</label>
									<textarea
										id='workspace-workflow-description'
										aria-label='Workflow description'
										value={workflowDescription}
										onChange={(event) =>
											setWorkflowDescription(event.target.value)
										}
										rows={3}
										placeholder='Optional description'
										className='dark:border-zinc-750 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-semibold text-slate-950 transition outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:bg-zinc-900 dark:text-white'
									/>
								</div>
								<div>
									<label
										htmlFor='workspace-workflow-folder'
										className='mb-1.5 block text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
										Folder
									</label>
									<select
										id='workspace-workflow-folder'
										aria-label='Workflow folder'
										value={workflowFolderId}
										onChange={(event) =>
											setWorkflowFolderId(event.target.value)
										}
										className='dark:border-zinc-750 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-950 transition outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:bg-zinc-900 dark:text-white'>
										<option value=''>Root level</option>
										{folders.map((folder) => (
											<option key={folder.id} value={folder.id}>
												{folder.name}
											</option>
										))}
									</select>
								</div>
								<div className='flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end'>
									<button
										type='button'
										onClick={() => setIsCreateWorkflowOpen(false)}
										className='h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'>
										Cancel
									</button>
									<button
										type='submit'
										disabled={createWorkflowMutation.isPending}
										className='h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-md shadow-violet-500/10 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60'>
										{createWorkflowMutation.isPending
											? 'Creating...'
											: 'Create Workflow'}
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}

				{isFolderModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 font-sans backdrop-blur-sm dark:bg-black/60'
						onClick={closeFolderModal}>
						<motion.div
							initial={{ scale: 0.95, y: 15 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.95, y: 15 }}
							transition={{ duration: 0.2 }}
							className='relative max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-zinc-700 dark:bg-zinc-900'
							onClick={(event) => event.stopPropagation()}>
							<button
								type='button'
								aria-label='Close folder dialog'
								onClick={closeFolderModal}
								className='hover:text-slate-655 absolute top-4 right-4 text-slate-400 transition dark:text-zinc-500 dark:hover:text-zinc-300'>
								<X size={18} />
							</button>
							<h3 className='mb-5 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white'>
								{editingFolder ? (
									<Edit3 className='h-5 w-5 text-violet-600' />
								) : (
									<FolderPlus className='h-5 w-5 text-violet-600' />
								)}
								{editingFolder ? 'Edit Folder' : 'Create Folder'}
							</h3>
							<form onSubmit={handleSaveFolder} className='space-y-4'>
								<div>
									<label
										htmlFor='workspace-folder-name'
										className='mb-1.5 block text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
										Folder Name
									</label>
									<input
										id='workspace-folder-name'
										aria-label='Folder name'
										required
										value={folderName}
										onChange={(event) => setFolderName(event.target.value)}
										placeholder='e.g. Sales operations'
										className='text-slate-955 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold transition outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white'
									/>
								</div>
								<div>
									<p className='mb-2 text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
										Folder Color
									</p>
									<div className='flex flex-wrap items-center gap-2.5'>
										{FOLDER_COLOR_OPTIONS.map((color) => (
											<button
												key={color.value}
												type='button'
												aria-label={`Use ${color.label} folder color`}
												title={color.label}
												onClick={() => setFolderColor(color.value)}
												className={`h-8 w-8 rounded-full ${color.value} border-2 transition ${
													folderColor === color.value
														? 'scale-110 border-slate-900 shadow-md dark:border-white'
														: 'border-transparent hover:scale-105'
												}`}
											/>
										))}
									</div>
								</div>
								<div className='flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end'>
									<button
										type='button'
										onClick={closeFolderModal}
										className='h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'>
										Cancel
									</button>
									<button
										type='submit'
										disabled={
											createFolderMutation.isPending ||
											updateFolderMutation.isPending
										}
										className='h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-md shadow-violet-500/10 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60'>
										{editingFolder ? 'Save Changes' : 'Create Folder'}
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</Container>
	);
};

export default MyWorkspacePage;
