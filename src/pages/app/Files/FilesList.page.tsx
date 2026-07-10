import { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router';
import {
	FileImage,
	FileSpreadsheet,
	FileText,
	Folder,
	Search,
	Plus,
	ChevronDown,
	HardDrive,
	Users,
	Upload,
	Check,
	Trash2,
	Download,
	Layers,
	Menu,
	X as CloseIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OutletContextType } from './_layouts/Files.layout';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Container from '@/components/layout/Container';
import pages from '@/Routes/pages';
import useAsideStatus from '@/hooks/useAsideStatus';

interface IFileItem {
	id: string;
	name: string;
	meta: string;
	owner: string;
	date: string;
	icon: React.ComponentType<{ className?: string }>;
	tone: string;
	color: string;
	category: 'Documents' | 'Spreadsheets' | 'Images';
	type: string;
	size: string;
}

interface ICollectionItem {
	id: string;
	name: string;
	count: string;
	tone: string;
	color: string;
}

const initialFiles: IFileItem[] = [
	{
		id: '1',
		name: 'Avatar concept render',
		meta: 'JPG · 2.8 MB',
		owner: 'Amaan',
		date: 'May 9',
		icon: FileImage,
		tone: 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400',
		color: '#F97316',
		category: 'Images',
		type: 'JPG',
		size: '2.8 MB',
	},
	{
		id: '2',
		name: 'Skill creator research brief',
		meta: 'DOC · 824 KB',
		owner: 'Agent Studio',
		date: 'May 13',
		icon: FileText,
		tone: 'bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400',
		color: '#0EA5E9',
		category: 'Documents',
		type: 'DOC',
		size: '824 KB',
	},
	{
		id: '3',
		name: 'Spreadsheet analyst setup',
		meta: 'CSV · 1.2 MB',
		owner: 'Data Agent',
		date: 'May 9',
		icon: FileSpreadsheet,
		tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
		color: '#10B981',
		category: 'Spreadsheets',
		type: 'CSV',
		size: '1.2 MB',
	},
];

const initialCollections: ICollectionItem[] = [
	{
		id: 'c1',
		name: 'Design Assets',
		count: '12 files',
		tone: 'bg-zinc-950 text-white dark:bg-zinc-800 dark:text-zinc-200',
		color: '#0f172a',
	},
	{
		id: 'c2',
		name: 'Research Docs',
		count: '8 files',
		tone: 'bg-emerald-500 text-white dark:bg-emerald-600 dark:text-emerald-200',
		color: '#00b274',
	},
	{
		id: 'c3',
		name: 'Data Exports',
		count: '6 files',
		tone: 'bg-cyan-500 text-white dark:bg-cyan-600 dark:text-cyan-200',
		color: '#1890ff',
	},
];

const getOwnerBadgeClass = (owner: string) => {
	if (owner === 'Amaan') {
		return 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/20';
	}
	if (owner === 'Agent Studio') {
		return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20';
	}
	if (owner === 'Data Agent') {
		return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20';
	}
	return 'bg-slate-50 text-slate-605 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-100/50 dark:border-zinc-700/20';
};

const FilesListPage = () => {
	const { setHeaderLeft } = useOutletContext<OutletContextType>();
	const { toggleAside } = useAsideStatus();

	useEffect(() => {
		setHeaderLeft(<Breadcrumb list={[{ ...pages.app.subPages.files }]} />);
		return () => setHeaderLeft(undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// State lists
	const [filesList, setFilesList] = useState<IFileItem[]>(initialFiles);
	const [collectionsList] = useState<ICollectionItem[]>(initialCollections);

	// Search & Category Filters
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<
		'All' | 'Documents' | 'Spreadsheets' | 'Images' | 'Collections'
	>('All');

	// Upload modal states
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [uploadStep, setUploadStep] = useState<1 | 2 | 3>(1);
	const [uploadProgress, setUploadProgress] = useState(0);

	// Form input states
	const [newFileName, setNewFileName] = useState('Workspace logo layout');
	const [newFileType, setNewFileType] = useState('JPG');
	const [newFileSize, setNewFileSize] = useState('1.5 MB');
	const [newFileOwner, setNewFileOwner] = useState('Sahil');

	// Dynamic counts
	const totalFilesCount = filesList.length;
	const filesUpdatedThisWeek = useMemo(() => {
		// Mock calculations
		return filesList.filter((f) => f.date.includes('May')).length;
	}, [filesList]);

	// Filter files based on search & category
	const filteredFiles = useMemo(() => {
		return filesList.filter((file) => {
			const matchesSearch =
				file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				file.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
				file.type.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesCategory =
				selectedCategory === 'All' ||
				(selectedCategory !== 'Collections' && file.category === selectedCategory);

			return matchesSearch && matchesCategory;
		});
	}, [filesList, searchQuery, selectedCategory]);

	// Filter collections based on search
	const filteredCollections = useMemo(() => {
		return collectionsList.filter((col) => {
			return col.name.toLowerCase().includes(searchQuery.toLowerCase());
		});
	}, [collectionsList, searchQuery]);

	// Delete file action
	const handleDeleteFile = (id: string) => {
		setFilesList((prev) => prev.filter((f) => f.id !== id));
	};

	// Start simulated file upload progress
	const handleStartUpload = () => {
		setUploadStep(2);
		setUploadProgress(0);

		let progress = 0;
		const interval = setInterval(() => {
			progress += 10;
			setUploadProgress(progress);

			if (progress >= 100) {
				clearInterval(interval);

				let fileIcon = FileText;
				let fileTone = 'bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400';
				let fileColor = '#0EA5E9';
				let fileCategory: 'Documents' | 'Spreadsheets' | 'Images' = 'Documents';

				if (newFileType === 'CSV') {
					fileIcon = FileSpreadsheet;
					fileTone =
						'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
					fileColor = '#10B981';
					fileCategory = 'Spreadsheets';
				} else if (newFileType === 'JPG') {
					fileIcon = FileImage;
					fileTone =
						'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400';
					fileColor = '#F97316';
					fileCategory = 'Images';
				}

				const newFile: IFileItem = {
					id: Date.now().toString(),
					name: newFileName,
					meta: `${newFileType} · ${newFileSize}`,
					owner: newFileOwner,
					date: new Date().toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
					}),
					icon: fileIcon,
					tone: fileTone,
					color: fileColor,
					category: fileCategory,
					type: newFileType,
					size: newFileSize,
				};

				setFilesList((prev) => [newFile, ...prev]);
				setUploadStep(3);
			}
		}, 120);
	};

	const renderFileCard = (file: IFileItem) => {
		const IconComponent = file.icon;
		return (
			<motion.article
				key={file.id}
				layout
				initial={{ opacity: 0, scale: 0.96, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.96, y: 10 }}
				whileHover={{ y: -6, scale: 1.01 }}
				transition={{ type: 'spring', stiffness: 350, damping: 25 }}
				className='group relative flex flex-col justify-between rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-350 hover:border-violet-500/30 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#11131c] dark:hover:border-violet-500/30'>
				<div className='flex items-start justify-between gap-4'>
					<div
						className='relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-inner transition-transform duration-300 group-hover:scale-105'
						style={{ backgroundColor: file.color }}>
						<IconComponent className='h-5 w-5 text-white' />
					</div>

					<div className='flex items-center gap-1'>
						<button
							onClick={() => alert(`Mock downloading: ${file.name}`)}
							className='hover:text-slate-650 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
							title='Download file'>
							<Download size={15} />
						</button>
						<button
							onClick={() => handleDeleteFile(file.id)}
							className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50/50 hover:text-red-500 dark:text-zinc-500 dark:hover:bg-red-950/20 dark:hover:text-red-400'
							title='Delete file'>
							<Trash2 size={15} />
						</button>
					</div>
				</div>

				<div className='mt-5 text-left'>
					<h3
						className='truncate text-sm font-bold text-slate-900 dark:text-white'
						title={file.name}>
						{file.name}
					</h3>
					<p className='mt-1 text-[11px] font-semibold text-slate-400 uppercase dark:text-zinc-500'>
						{file.type} • {file.size}
					</p>
				</div>

				<div className='mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3 text-[10px] font-bold text-slate-400 dark:border-zinc-800/60 dark:text-zinc-500'>
					<span
						className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${getOwnerBadgeClass(file.owner)}`}>
						{file.owner}
					</span>
					<span>Uploaded: {file.date}</span>
				</div>
			</motion.article>
		);
	};

	const renderCollectionCard = (col: ICollectionItem) => {
		return (
			<motion.article
				key={col.id}
				layout
				initial={{ opacity: 0, scale: 0.96, y: 10 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.96, y: 10 }}
				whileHover={{ y: -4, scale: 1.01 }}
				transition={{ type: 'spring', stiffness: 350, damping: 25 }}
				className='group relative flex items-center justify-between rounded-[24px] border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#11131c] dark:hover:border-emerald-500/30'>
				<div className='flex items-center gap-4 text-left'>
					<div
						className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105'
						style={{ backgroundColor: col.color }}>
						<Folder className='h-5 w-5 text-white' />
					</div>
					<div>
						<h3 className='max-w-[150px] truncate text-sm font-bold text-slate-900 dark:text-white'>
							{col.name}
						</h3>
						<p className='mt-0.5 text-[11px] font-semibold text-slate-400 dark:text-zinc-500'>
							{col.count}
						</p>
					</div>
				</div>

				<button
					onClick={() => alert(`Opening collection folder: ${col.name}`)}
					className='h-8 cursor-pointer rounded-lg bg-[#00b274] px-4 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#009b65] active:scale-[0.97]'>
					Open
				</button>
			</motion.article>
		);
	};

	return (
		<Container className='relative overflow-x-hidden overflow-y-auto bg-[#f8f9fc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] !p-0 dark:bg-zinc-950 dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]'>
			{/* Ambient decorative blur glows */}
			<div className='pointer-events-none absolute top-[-10%] right-[-10%] -z-10 h-[45%] w-[45%] rounded-full bg-gradient-to-tr from-violet-500/5 to-indigo-500/5 blur-[120px]' />
			<div className='pointer-events-none absolute bottom-[-10%] left-[-10%] -z-10 h-[45%] w-[45%] rounded-full bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 blur-[120px]' />

			<div className='mx-auto flex w-full max-w-7xl flex-col space-y-8 p-4 sm:p-6 md:p-8'>
				{/* Header panel */}
				<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
					<div className='flex items-start gap-4'>
						{/* Mobile Toggle Aside Menu Button */}
						<button
							onClick={toggleAside}
							type='button'
							className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm md:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
						>
							<Menu size={18} />
						</button>

						<div className='flex flex-col text-left'>
							<h1 className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none'>
								Files
							</h1>
							<p className='mt-1 text-[11px] font-extrabold tracking-widest text-[#503ef5] uppercase dark:text-violet-400'>
								Workspace library
							</p>
							<p className='mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400 leading-normal'>
								Upload and manage your secure workspace files, documents, and generated
								assets.
							</p>
						</div>
					</div>

					<button
						onClick={() => {
							setNewFileName('Workspace logo layout');
							setNewFileType('JPG');
							setNewFileSize('1.5 MB');
							setNewFileOwner('Sahil');
							setUploadStep(1);
							setIsUploadModalOpen(true);
						}}
						className='flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#503ef5] px-5 text-xs font-bold text-white shadow-md shadow-[#503ef5]/10 transition-all hover:bg-[#3f2fe3] hover:shadow-lg hover:shadow-[#503ef5]/20 active:scale-95 dark:shadow-none'>
						<Plus size={14} className='stroke-[2.5px]' />
						<span>Upload File</span>
						<ChevronDown size={14} />
					</button>
				</div>

				{/* Stats overview row */}
				<div className='grid grid-cols-1 gap-5 sm:grid-cols-3'>
					{/* Card 1: Total Files */}
					<div className='group relative overflow-hidden rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300/80 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#11131c]'>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#503ef5] dark:bg-purple-950/20 dark:text-purple-400'>
								<Folder size={18} className='stroke-[2.2px]' />
							</div>
							<span className='text-[11px] font-extrabold tracking-wider text-slate-400 uppercase dark:text-zinc-400'>
								Total Files
							</span>
						</div>
						<div className='mt-4 flex items-baseline gap-1.5'>
							<span className='text-3xl font-extrabold text-slate-900 dark:text-white'>
								{totalFilesCount}
							</span>
							<span className='text-xs font-semibold text-slate-400 dark:text-zinc-500'>
								items
							</span>
						</div>
						<div className='mt-3 flex items-center gap-1 text-xs font-bold text-emerald-500'>
							<span>↑</span>
							<span>{filesUpdatedThisWeek} updated this month</span>
						</div>

						{/* Stacked document illustration */}
						<div className='pointer-events-none absolute right-6 bottom-4 hidden h-16 w-20 select-none sm:block'>
							<div className='absolute right-2 bottom-3 h-14 w-12 translate-x-[-8px] rotate-[-10deg] skew-y-[-4deg] rounded-xl border border-indigo-500/10 bg-indigo-500/10' />
							<div className='absolute right-0 bottom-1 flex h-14 w-12 rotate-[-2deg] flex-col rounded-xl border border-white/60 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-2 shadow-lg shadow-indigo-500/5 backdrop-blur-[2px]'>
								<div className='mb-1 h-1 w-full rounded-full bg-violet-400/30' />
								<div className='mb-1 h-1 w-2/3 rounded-full bg-violet-400/30' />
								<div className='h-1 w-1/2 rounded-full bg-violet-400/30' />
							</div>
						</div>
					</div>

					{/* Card 2: Shared Items */}
					<div className='group relative overflow-hidden rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300/80 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#11131c]'>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'>
								<Users size={18} className='stroke-[2.2px]' />
							</div>
							<span className='text-[11px] font-extrabold tracking-wider text-slate-400 uppercase dark:text-zinc-400'>
								Shared Items
							</span>
						</div>
						<div className='mt-4 flex items-baseline gap-1.5'>
							<span className='text-3xl font-extrabold text-slate-900 dark:text-white'>
								36
							</span>
							<span className='text-xs font-semibold text-slate-400 dark:text-zinc-500'>
								assets
							</span>
						</div>
						<div className='mt-3 flex items-center gap-1.5 text-xs font-bold text-[#503ef5]'>
							<Users size={14} className='stroke-[2.2px] text-[#503ef5]' />
							<span>8 active collaborators</span>
						</div>

						{/* Overlapping soft circles illustration */}
						<div className='pointer-events-none absolute right-6 bottom-4 hidden h-16 w-20 select-none sm:block'>
							<div className='absolute right-6 bottom-2 h-10 w-10 rounded-full border border-blue-500/10 bg-blue-500/5' />
							<div className='absolute right-1 bottom-1 h-10 w-10 rounded-full border border-indigo-500/10 bg-indigo-500/10 backdrop-blur-[1px]' />
						</div>
					</div>

					{/* Card 3: Storage Usage */}
					<div className='group relative overflow-hidden rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300/80 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#11131c]'>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'>
								<HardDrive size={18} className='stroke-[2.2px]' />
							</div>
							<span className='text-[11px] font-extrabold tracking-wider text-slate-400 uppercase dark:text-zinc-400'>
								Storage Usage
							</span>
						</div>
						<div className='mt-4 flex items-baseline gap-1.5'>
							<span className='text-3xl font-extrabold text-slate-900 dark:text-white'>
								18.4 GB
							</span>
							<span className='text-xs font-semibold text-slate-400 dark:text-zinc-500'>
								of 30 GB
							</span>
						</div>

						<div className='mt-4 flex items-center justify-between gap-4 pr-16'>
							<div className='h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800'>
								<div
									className='h-2 rounded-full bg-emerald-500'
									style={{ width: '61%' }}
								/>
							</div>
							<span className='shrink-0 text-xs font-extrabold text-[#00b274]'>
								61%
							</span>
						</div>

						{/* Cylinder graphic lines */}
						<div className='pointer-events-none absolute right-2 bottom-3 hidden opacity-20 select-none sm:block'>
							<svg
								width='60'
								height='50'
								viewBox='0 0 60 50'
								fill='none'
								className='text-emerald-500'>
								<path
									d='M5 15C5 8 55 8 55 15'
									stroke='currentColor'
									strokeWidth='1.5'
									strokeDasharray='2 2'
								/>
								<path
									d='M5 28C5 21 55 21 55 28'
									stroke='currentColor'
									strokeWidth='1.5'
								/>
								<path
									d='M5 40C5 33 55 33 55 40'
									stroke='currentColor'
									strokeWidth='1.5'
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* Search & Categories Bar */}
				<div className='flex w-full flex-col justify-between gap-4 md:flex-row md:items-center'>
					<div className='group relative flex-1'>
						<Search className='absolute top-3.5 left-4 h-4.5 w-4.5 text-slate-400 transition-colors duration-200 group-focus-within:text-[#503ef5] dark:text-zinc-500' />
						<input
							type='search'
							aria-label='Search files'
							placeholder='Search files, owners, or formats...'
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
							}}
							className='dark:placeholder:text-zinc-650 block h-12 w-full rounded-2xl border border-slate-200/60 bg-white pr-14 pl-12 text-xs font-bold text-slate-900 shadow-sm transition-all duration-200 outline-none placeholder:text-slate-400 focus:border-[#503ef5]/80 focus:ring-4 focus:ring-[#503ef5]/10 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:ring-violet-500/15'
						/>
						<div className='pointer-events-none absolute top-3.5 right-4 hidden items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-400 shadow-2xs sm:flex dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-500'>
							⌘K
						</div>
					</div>

					{/* Category tabs */}
					<div className='no-scrollbar flex shrink-0 gap-2 overflow-x-auto pb-1 md:pb-0'>
						{(
							[
								{ id: 'All', label: 'All', icon: Layers },
								{ id: 'Documents', label: 'Documents', icon: FileText },
								{
									id: 'Spreadsheets',
									label: 'Spreadsheets',
									icon: FileSpreadsheet,
								},
								{ id: 'Images', label: 'Images', icon: FileImage },
								{ id: 'Collections', label: 'Collections', icon: Folder },
							] as const
						).map((cat) => {
							const isActive = selectedCategory === cat.id;
							const TabIcon = cat.icon;
							return (
								<button
									key={cat.id}
									type='button'
									onClick={() => {
										setSelectedCategory(cat.id);
									}}
									className={`flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-5 text-xs transition-all duration-200 ${
										isActive
											? 'border border-[#503ef5] bg-[#503ef5] font-extrabold text-white shadow-sm'
											: 'border border-slate-200/60 bg-white font-bold text-slate-600 shadow-xs hover:bg-slate-50 dark:border-zinc-800/80 dark:bg-[#11131c] dark:text-zinc-400 dark:hover:bg-zinc-800/20'
									}`}>
									<TabIcon
										size={14}
										className={
											isActive
												? 'text-white'
												: 'text-slate-400 dark:text-zinc-500'
										}
									/>
									<span>{cat.label}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Grid Layouts depending on category */}
				<div className='min-h-[300px]'>
					<AnimatePresence mode='popLayout'>
						{selectedCategory === 'All' && (
							<motion.div
								key='all-view'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className='space-y-10'>
								{/* Files Section */}
								<div>
									<h2 className='mb-4 text-xs font-extrabold tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
										Workspace Files ({filteredFiles.length})
									</h2>
									{filteredFiles.length === 0 ? (
										<div className='flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/40 dark:border-zinc-800 dark:bg-zinc-900/20'>
											<p className='text-xs font-bold text-slate-400 dark:text-zinc-500'>
												No files found matching search.
											</p>
										</div>
									) : (
										<div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
											{filteredFiles.map(renderFileCard)}
										</div>
									)}
								</div>

								{/* Collections Section */}
								<div>
									<h2 className='mb-4 text-xs font-extrabold tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
										Workspace Collections ({filteredCollections.length})
									</h2>
									{filteredCollections.length === 0 ? (
										<div className='flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/40 dark:border-zinc-800 dark:bg-zinc-900/20'>
											<p className='text-xs font-bold text-slate-400 dark:text-zinc-500'>
												No collections found matching search.
											</p>
										</div>
									) : (
										<div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
											{filteredCollections.map(renderCollectionCard)}
										</div>
									)}
								</div>
							</motion.div>
						)}

						{selectedCategory !== 'All' && selectedCategory !== 'Collections' && (
							<motion.div
								key='category-view'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}>
								<h2 className='mb-4 text-xs font-extrabold tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
									{selectedCategory} ({filteredFiles.length})
								</h2>
								{filteredFiles.length === 0 ? (
									<div className='flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/40 dark:border-zinc-800 dark:bg-zinc-900/20'>
										<Folder className='mb-3 h-12 w-12 animate-pulse text-slate-300 dark:text-zinc-700' />
										<p className='text-xs font-bold text-slate-400 dark:text-zinc-500'>
											No files found in this category.
										</p>
									</div>
								) : (
									<div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
										{filteredFiles.map(renderFileCard)}
									</div>
								)}
							</motion.div>
						)}

						{selectedCategory === 'Collections' && (
							<motion.div
								key='collections-only-view'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}>
								<h2 className='mb-4 text-xs font-extrabold tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
									Collections ({filteredCollections.length})
								</h2>
								{filteredCollections.length === 0 ? (
									<div className='flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/40 dark:border-zinc-800 dark:bg-zinc-900/20'>
										<Folder className='mb-3 h-12 w-12 animate-pulse text-slate-300 dark:text-zinc-700' />
										<p className='text-xs font-bold text-slate-400 dark:text-zinc-500'>
											No collections found matching search query.
										</p>
									</div>
								) : (
									<div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
										{filteredCollections.map(renderCollectionCard)}
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Intake queue banner */}
				<div className='group relative mt-8 overflow-hidden rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-xs backdrop-blur-md dark:border-emerald-500/20 dark:bg-emerald-950/10'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
						<div className='flex items-start gap-3'>
							<div className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400'>
								<Check size={16} />
							</div>
							<div>
								<h3 className='text-sm font-black text-emerald-800 dark:text-emerald-400'>
									Intake queue clear
								</h3>
								<p className='mt-1 text-xs font-semibold text-emerald-700/80 dark:text-emerald-500/70'>
									New files are scanned, indexed, and versioned automatically
									before agents can consume them.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Upload Popup Dialog Overlay */}
			<AnimatePresence>
				{isUploadModalOpen && (
					<div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 font-sans text-slate-950 backdrop-blur-md dark:bg-black/70 dark:text-zinc-50'>
						{/* STEP 1: UPLOAD FILE FORM */}
						{uploadStep === 1 && (
							<motion.div
								initial={{ opacity: 0, scale: 0.96, y: 15 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.96, y: 15 }}
								className='relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-[#11131c]'>
								{/* Close button */}
								<button
									aria-label='Close file upload dialog'
									onClick={() => setIsUploadModalOpen(false)}
									className='absolute top-4 right-4 cursor-pointer rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'>
									<CloseIcon className='h-4.5 w-4.5' />
								</button>

								<div>
									<h2 className='text-lg font-black text-slate-900 dark:text-white'>
										Upload File
									</h2>
									<p className='mt-1 text-xs font-bold text-slate-400 dark:text-zinc-500'>
										Add a simulated file to your workspace files library.
									</p>
								</div>

								<div className='mt-6 space-y-4 text-left'>
									<div>
										<label className='block text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
											File Name
										</label>
										<input
											type='text'
											value={newFileName}
											onChange={(e) => setNewFileName(e.target.value)}
											className='mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-900 transition-all outline-none focus:border-violet-500/80 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:ring-violet-500/15'
										/>
									</div>

									<div className='grid grid-cols-2 gap-4'>
										<div>
											<label className='block text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
												File Type
											</label>
											<select
												value={newFileType}
												onChange={(e) => setNewFileType(e.target.value)}
												className='mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 transition-all outline-none focus:border-violet-500/80 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:ring-violet-500/15'>
												<option value='DOC'>Document (DOC)</option>
												<option value='CSV'>Spreadsheet (CSV)</option>
												<option value='JPG'>Image (JPG)</option>
											</select>
										</div>

										<div>
											<label className='block text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
												File Size
											</label>
											<input
												type='text'
												value={newFileSize}
												onChange={(e) => setNewFileSize(e.target.value)}
												className='mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-900 transition-all outline-none focus:border-violet-500/80 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:ring-violet-500/15'
											/>
										</div>
									</div>

									<div>
										<label className='block text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
											Owner Name
										</label>
										<input
											type='text'
											value={newFileOwner}
											onChange={(e) => setNewFileOwner(e.target.value)}
											className='mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-900 transition-all outline-none focus:border-violet-500/80 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:ring-violet-500/15'
										/>
									</div>

									<button
										onClick={handleStartUpload}
										className='mt-6 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-violet-600/30 active:scale-95 dark:shadow-none'>
										<Upload size={14} />
										<span>Start Upload</span>
									</button>
								</div>
							</motion.div>
						)}

						{/* STEP 2: UPLOAD PROGRESS ANIMATION */}
						{uploadStep === 2 && (
							<motion.div
								initial={{ opacity: 0, scale: 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.96 }}
								className='w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-2xl dark:border-zinc-800/80 dark:bg-[#11131c]'>
								<div className='flex flex-col items-center justify-center'>
									<div className='relative flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/5 dark:text-violet-400'>
										<Upload size={24} className='animate-bounce' />
									</div>
									<h2 className='mt-6 text-lg font-black text-slate-900 dark:text-white'>
										Uploading File
									</h2>
									<p className='mt-1 text-xs font-semibold text-slate-400 dark:text-zinc-500'>
										Sending {newFileName} to the cloud...
									</p>
								</div>

								{/* Progress percentage bar */}
								<div className='mt-8'>
									<div className='mb-2 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400'>
										<span>Progress</span>
										<span>{uploadProgress}%</span>
									</div>
									<div className='h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800'>
										<motion.div
											className='h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600'
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
								</div>
							</motion.div>
						)}

						{/* STEP 3: SUCCESS STATE */}
						{uploadStep === 3 && (
							<motion.div
								initial={{ opacity: 0, scale: 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.96 }}
								className='w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-2xl dark:border-zinc-800/80 dark:bg-[#11131c]'>
								<div className='flex flex-col items-center justify-center'>
									<div className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-400'>
										<Check size={28} strokeWidth={3} />
									</div>
									<h2 className='mt-6 text-lg font-black text-slate-900 dark:text-white'>
										Upload Complete!
									</h2>
									<p className='mt-1 text-xs font-semibold text-slate-400 dark:text-zinc-500'>
										{newFileName} has been added to your library.
									</p>
								</div>

								<button
									onClick={() => {
										setIsUploadModalOpen(false);
										setUploadStep(1);
										setUploadProgress(0);
									}}
									className='mt-8 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/30 active:scale-95 dark:shadow-none'>
									<span>Dismiss</span>
								</button>
							</motion.div>
						)}
					</div>
				)}
			</AnimatePresence>
		</Container>
	);
};

export default FilesListPage;
