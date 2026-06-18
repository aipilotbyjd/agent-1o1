import { Outlet, useNavigate } from 'react-router';
import Header, { HeaderLeft, HeaderRight } from '@/components/layout/Header';
import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import ChangeDarkModeTemplate from '@/templates/header/ChangeDarkMode.template';
import Dropdown, {
	DropdownDivider,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '@/components/ui/Dropdown';
import { useAuth } from '@/context/authContext';
import { Bell, Keyboard, ChevronDown } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

export interface OutletContextType {
	headerLeft?: ReactNode;
	setHeaderLeft: Dispatch<SetStateAction<ReactNode>>;
}

const HistoryLayout = () => {
	const [headerLeft, setHeaderLeft] = useState<ReactNode>('');
	const navigate = useNavigate();
	const { userData, onLogout } = useAuth();

	const name = userData?.name || 'jkhkjh';
	const initial = name.charAt(0).toUpperCase() || 'J';

	return (
		<>
			<Header>
				<HeaderLeft>{headerLeft}</HeaderLeft>
				<HeaderRight>
					<ChangeDarkModeTemplate />

					<Tooltip text='Keyboard shortcuts'>
						<button
							type='button'
							aria-label='Keyboard shortcuts'
							className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900'>
							<Keyboard size={16} />
						</button>
					</Tooltip>

					<Dropdown>
						<DropdownToggle hasIcon={false}>
							<button
								type='button'
								aria-label='Notifications'
								className='relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900'>
								<Bell size={16} />
								<span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-zinc-950'>
									3
								</span>
							</button>
						</DropdownToggle>
						<DropdownMenu
							placement='bottom-end'
							className='max-w-sm min-w-[280px] rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95'>
							<div className='px-2.5 py-1.5 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
								Notifications
							</div>
							<DropdownItem className='rounded-xl py-2.5'>
								<div className='flex flex-col gap-0.5 text-xs'>
									<span className='font-bold text-slate-900 dark:text-white'>
										System Update
									</span>
									<span className='text-slate-500 dark:text-zinc-400'>
										New agent models added successfully.
									</span>
								</div>
							</DropdownItem>
							<DropdownItem className='rounded-xl py-2.5'>
								<div className='flex flex-col gap-0.5 text-xs'>
									<span className='font-bold text-slate-900 dark:text-white'>
										Workflow Completed
									</span>
									<span className='text-slate-500 dark:text-zinc-400'>
										Lead Enrichment Pipeline run finished.
									</span>
								</div>
							</DropdownItem>
							<DropdownDivider className='my-2 border-slate-100/80 dark:border-zinc-800/80' />
							<div className='px-2.5 text-center'>
								<button
									onClick={() => navigate('/notifications')}
									className='text-xs font-bold text-violet-600 hover:underline dark:text-violet-400'>
									View all notifications
								</button>
							</div>
						</DropdownMenu>
					</Dropdown>

					<Dropdown>
						<DropdownToggle hasIcon={false}>
							<button
								type='button'
								className='group flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3.5 pl-2 text-xs font-extrabold text-slate-700 shadow-xs transition-all duration-300 select-none hover:border-violet-500/40 hover:bg-white hover:text-violet-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-violet-500/30 dark:hover:bg-zinc-900 dark:hover:text-violet-400'>
								<div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-xs font-black text-white shadow-2xs transition-transform duration-300 group-hover:scale-105'>
									{initial}
								</div>
								<span className='max-w-[100px] truncate font-extrabold tracking-wide dark:text-zinc-300'>
									{name}
								</span>
								<ChevronDown
									size={12}
									className='ml-0.5 shrink-0 text-slate-400 transition-transform duration-300 group-hover:text-violet-500 group-aria-expanded:rotate-180 group-[.show]:rotate-180 dark:text-zinc-500 dark:group-hover:text-violet-400'
								/>
							</button>
						</DropdownToggle>
						<DropdownMenu className='max-w-xs min-w-xs rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95'>
							<div className='px-2.5 py-1.5 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase dark:text-zinc-500'>
								Account Options
							</div>
							<DropdownItem
								onClick={() => navigate('/settings/profile')}
								className='rounded-xl'>
								My Profile
							</DropdownItem>
							<DropdownItem
								onClick={() => navigate('/settings/workspace')}
								className='rounded-xl'>
								Workspace Settings
							</DropdownItem>
							<DropdownDivider className='my-2 border-slate-100/80 dark:border-zinc-800/80' />
							<DropdownItem
								onClick={() => onLogout?.(true)}
								className='rounded-xl text-rose-600 hover:bg-rose-500/5 dark:text-rose-400'>
								Sign out
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</HeaderRight>
			</Header>
			<Outlet context={{ headerLeft, setHeaderLeft }} />
		</>
	);
};

export default HistoryLayout;
