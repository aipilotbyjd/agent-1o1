import {
	ArrowLeft,
	BriefcaseBusiness,
	ChevronDown,
	ShieldCheck,
	Sparkles,
	Trash2,
} from 'lucide-react';
import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useWorkflowShellStore } from '@/store/workflowShell.store';
import { useWorkspaceContext } from '@/context/workspaceContext';
import { useUpdateWorkspace, useDeleteWorkspace } from '@/api/modules/workspaces';

const SettingsRow = ({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: ReactNode;
}) => (
	<div className='grid gap-4 border-b border-zinc-200 py-6 lg:grid-cols-[minmax(240px,1fr)_minmax(420px,1.05fr)] lg:items-center dark:border-zinc-700'>
		<div>
			<div className='text-base font-bold tracking-tight text-zinc-950 dark:text-zinc-50'>
				{title}
			</div>
			{description && (
				<div className='mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400'>
					{description}
				</div>
			)}
		</div>
		<div className='flex min-w-0 items-center justify-end gap-3'>{children}</div>
	</div>
);

const inputClass =
	'h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-900 shadow-xs outline-none placeholder:text-zinc-400 focus:border-pink-350 focus:ring-4 focus:ring-pink-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-550 dark:focus:border-pink-500 dark:focus:ring-pink-500/25';

const secondaryButtonClass =
	'h-12 rounded-xl border border-zinc-200 bg-white px-5 text-base font-bold text-zinc-500 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200';

const SettingsSurface = () => {
	const navigate = useNavigate();
	const setActiveWorkspaceView = useWorkflowShellStore((store) => store.setActiveWorkspaceView);

	const { activeWorkspaceId, activeWorkspace, role } = useWorkspaceContext();

	const updateWorkspace = useUpdateWorkspace();
	const deleteWorkspace = useDeleteWorkspace();

	const [workspaceName, setWorkspaceName] = useState('');
	const [timezone, setTimezone] = useState('Asia/Kolkata');

	useEffect(() => {
		if (activeWorkspace) {
			setWorkspaceName(activeWorkspace.name);
			if (activeWorkspace.settings?.timezone) {
				setTimezone(activeWorkspace.settings.timezone);
			}
		}
	}, [activeWorkspace]);

	const isDirty = useMemo(() => {
		if (!activeWorkspace) return false;
		return (
			workspaceName !== activeWorkspace.name ||
			timezone !== (activeWorkspace.settings?.timezone ?? 'Asia/Kolkata')
		);
	}, [activeWorkspace, workspaceName, timezone]);

	const goBack = () => {
		setActiveWorkspaceView('workflows');
		navigate('/app/editor/new');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!workspaceName.trim() || !activeWorkspaceId) return;

		try {
			await updateWorkspace.mutateAsync({
				id: activeWorkspaceId,
				body: {
					name: workspaceName.trim(),
					settings: {
						timezone,
					},
				},
			});
		} catch {
			// Toast notification is managed by hook
		}
	};

	const handleReset = () => {
		if (activeWorkspace) {
			setWorkspaceName(activeWorkspace.name);
			setTimezone(activeWorkspace.settings?.timezone ?? 'Asia/Kolkata');
		}
	};

	const isOwner = role === 'owner';

	const handleDeleteWorkspace = async () => {
		if (!activeWorkspaceId || !activeWorkspace) return;
		const confirmed = window.confirm(
			`Are you sure you want to permanently delete workspace "${activeWorkspace.name}"? This action cannot be undone.`,
		);
		if (!confirmed) return;

		try {
			await deleteWorkspace.mutateAsync(activeWorkspaceId);
			navigate('/workspaces');
		} catch {
			// Toast notification is managed by hook
		}
	};

	return (
		<div className='mx-auto w-full max-w-[1180px] px-6 py-10 text-zinc-950 sm:px-10 lg:px-14 lg:py-16 dark:text-zinc-50'>
			<div className='mb-10 flex items-start justify-between gap-5'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white'>
						Workspace Settings
					</h1>
					<p className='mt-2 text-base font-medium text-zinc-500 dark:text-zinc-400'>
						Manage your workspace configuration and preferences
					</p>
				</div>
				<button
					type='button'
					onClick={goBack}
					className='flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-700 shadow-xs transition hover:bg-zinc-50 md:hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'>
					<ArrowLeft size={17} />
					Back
				</button>
			</div>

			<form onSubmit={handleSubmit}>
				<section>
					<div className='border-b border-zinc-200 pb-5 text-base font-bold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'>
						General Workspace Information
					</div>

					<SettingsRow
						title='Workspace Name'
						description='Visible to members inside this environment.'>
						<div className='w-full'>
							<input
								className={inputClass}
								value={workspaceName}
								onChange={(e) => setWorkspaceName(e.target.value)}
								aria-label='Workspace name'
							/>
						</div>
					</SettingsRow>

					<SettingsRow
						title='Workspace URL / Slug'
						description='Unique identifier for the workspace path.'>
						<div className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base font-bold text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500'>
							{activeWorkspace?.slug || 'Not available'}
						</div>
					</SettingsRow>

					<SettingsRow
						title='Your Access Role'
						description='Your permissions within this workspace.'>
						<div className='w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base font-bold text-zinc-400 capitalize dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500'>
							{role || 'member'}
						</div>
					</SettingsRow>

					<SettingsRow
						title='Workspace Timezone'
						description='Timezone for scheduling cron events and executions.'>
						<div className='relative w-full max-w-[520px]'>
							<select
								aria-label='Timezone'
								value={timezone}
								onChange={(e) => setTimezone(e.target.value)}
								className={`${inputClass} appearance-none pr-11`}>
								<option value='Asia/Kolkata'>Asia/Kolkata</option>
								<option value='America/New_York'>America/New_York</option>
								<option value='Europe/London'>Europe/London</option>
								<option value='UTC'>UTC</option>
							</select>
							<ChevronDown
								size={18}
								className='pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400'
							/>
						</div>
					</SettingsRow>

					<div className='mt-6 flex flex-wrap justify-end gap-3'>
						<button
							type='button'
							disabled={!isDirty || updateWorkspace.isPending}
							onClick={handleReset}
							className={secondaryButtonClass}>
							Reset
						</button>
						<button
							type='submit'
							disabled={!isDirty || updateWorkspace.isPending}
							className='h-12 rounded-xl bg-pink-500 px-6 text-base font-bold text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60'>
							{updateWorkspace.isPending ? 'Saving...' : 'Save changes'}
						</button>
					</div>
				</section>
			</form>

			{isOwner && (
				<section className='mt-9 border-t border-zinc-100 pt-9 dark:border-zinc-800'>
					<h2 className='dark:text-zinc-105 text-xl font-bold tracking-tight text-zinc-950'>
						Danger zone
					</h2>
					<div className='mt-7 flex flex-col gap-5 border-t border-zinc-100 pt-7 lg:flex-row lg:items-center lg:justify-between dark:border-zinc-800'>
						<div>
							<div className='flex items-center gap-2 text-lg font-bold text-red-500'>
								<Trash2 size={19} />
								Delete workspace
							</div>
							<p className='mt-1 max-w-2xl text-base font-medium text-zinc-500 dark:text-zinc-400'>
								This action cannot be undone. This will permanently delete your
								workspace and all resources, workflows, and logs inside it.
							</p>
						</div>
						<button
							type='button'
							disabled={deleteWorkspace.isPending}
							onClick={handleDeleteWorkspace}
							className='h-12 rounded-xl border border-red-700 bg-red-500 px-6 text-base font-bold text-white shadow-sm shadow-red-500/20 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 lg:min-w-40'>
							{deleteWorkspace.isPending ? 'Deleting...' : 'Delete workspace'}
						</button>
					</div>
				</section>
			)}

			<div className='mt-12 grid gap-3 border-t border-zinc-100 pt-6 text-sm text-zinc-400 sm:grid-cols-3 dark:border-zinc-800 dark:text-zinc-500'>
				<div className='flex items-center gap-2'>
					<Sparkles size={15} />
					Timezone configured
				</div>
				<div className='flex items-center gap-2'>
					<ShieldCheck size={15} />
					Security reviewed
				</div>
				<div className='flex items-center gap-2'>
					<BriefcaseBusiness size={15} />
					Active workspace
				</div>
			</div>
		</div>
	);
};

export default SettingsSurface;
