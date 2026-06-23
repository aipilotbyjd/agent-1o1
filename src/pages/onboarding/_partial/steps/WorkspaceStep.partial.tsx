import { Building2, Check, HelpCircle } from 'lucide-react';
import { useOnboardingStore } from '../../_context/OnboardingStore.context';
import { slugify } from '../../_helper/onboarding.helper';

interface IWorkspaceStepProps {
	workspaceError: string;
	setWorkspaceError: (v: string) => void;
	workspaceSlugTouched: boolean;
	setWorkspaceSlugTouched: (v: boolean) => void;
}

const WorkspaceStep = ({
	workspaceError,
	workspaceSlugTouched,
	setWorkspaceSlugTouched,
}: IWorkspaceStepProps) => {
	const { state, dispatch } = useOnboardingStore();
	const { workspaceName, workspaceSlug, workspaceCreated } = state;

	const handleWorkspaceNameChange = (value: string) => {
		dispatch({ type: 'SET_FIELD', payload: { workspaceName: value } });
		if (!workspaceSlugTouched) {
			dispatch({ type: 'SET_FIELD', payload: { workspaceSlug: slugify(value) } });
		}
	};

	return (
		<>
			<div>
				<h1 className='text-3xl leading-tight font-extrabold tracking-tight text-slate-950 dark:text-zinc-50'>
					Name your command center
				</h1>
				<p className='mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400'>
					This is where your agents live, your automations run, and your team collaborates
					— all in one place.
				</p>
			</div>

			{workspaceCreated ? (
				<div className='flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4'>
					<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500'>
						<Check className='h-5 w-5 stroke-[3]' />
					</div>
					<div>
						<p className='text-sm font-bold text-slate-900 dark:text-zinc-50'>
							"{workspaceName}" is live.
						</p>
						<p className='text-xs text-slate-400'>
							Your command center is set up. Let's bring your team in.
						</p>
					</div>
				</div>
			) : (
				<div className='space-y-4 pt-2'>
					<div className='space-y-2'>
						<label
							htmlFor='ws-name'
							className='block text-xs font-bold text-slate-600 dark:text-zinc-400'>
							Workspace Name
						</label>
						<div className='relative flex items-center'>
							<Building2 className='absolute left-3.5 h-4 w-4 text-slate-400' />
							<input
								id='ws-name'
								type='text'
								placeholder='Acme Automation'
								value={workspaceName}
								onChange={(e) => handleWorkspaceNameChange(e.target.value)}
								className='h-11 w-full rounded-xl border border-slate-200/90 bg-white/50 pr-4 pl-10 text-sm font-semibold transition-all outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800/80 dark:bg-zinc-950/40'
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<label
							htmlFor='ws-slug'
							className='block text-xs font-bold text-slate-600 dark:text-zinc-400'>
							Workspace URL
						</label>
						<div className='flex h-11 items-center overflow-hidden rounded-xl border border-slate-200/90 bg-white/50 transition-all focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 dark:border-zinc-800/80 dark:bg-zinc-950/40'>
							<span className='flex h-full items-center border-r border-slate-200 bg-slate-50/80 px-3 text-[11px] font-black text-slate-400 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-500'>
								agent1o1.app/
							</span>
							<input
								id='ws-slug'
								type='text'
								placeholder='acme'
								value={workspaceSlug}
								onChange={(e) => {
									dispatch({
										type: 'SET_FIELD',
										payload: { workspaceSlug: e.target.value },
									});
									setWorkspaceSlugTouched(true);
								}}
								className='min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none focus:ring-0 dark:text-zinc-100'
							/>
						</div>
					</div>

					{workspaceError && (
						<div className='flex items-center gap-1.5 text-[11px] font-bold text-rose-500'>
							<HelpCircle className='h-3.5 w-3.5 shrink-0' />
							{workspaceError}
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default WorkspaceStep;
