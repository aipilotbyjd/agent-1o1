import { Clock, Menu } from 'lucide-react';
import useAsideStatus from '@/hooks/useAsideStatus';

const HistoryPageHeader = () => {
	const { toggleAside } = useAsideStatus();

	return (
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
	);
};

export default HistoryPageHeader;
