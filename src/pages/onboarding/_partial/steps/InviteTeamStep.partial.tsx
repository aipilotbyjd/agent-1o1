import { Send } from 'lucide-react';
import { useOnboardingStore } from '../../_context/OnboardingStore.context';
import { ROLE_OPTIONS } from '../../_helper/onboarding.constants';
import { parseEmails, isValidEmail } from '../../_helper/onboarding.helper';
import type { TWorkspaceRole } from '@/types/workspace.type';

const InviteTeamStep = () => {
	const { state, dispatch } = useOnboardingStore();
	const { inviteEmails, inviteRole, inviteMessage, invitesSent } = state;

	const parsedInviteEmails = parseEmails(inviteEmails);
	const validInviteEmails = parsedInviteEmails.filter(isValidEmail);
	const hasValidEmails = validInviteEmails.length > 0;

	return (
		<>
			<div>
				<h1 className='text-3xl leading-tight font-extrabold tracking-tight text-slate-950 dark:text-zinc-50'>
					Who's building with you?
				</h1>
				<p className='mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400'>
					Automation is a team sport — invite the people who'll run and manage workflows
					alongside you.
				</p>
			</div>

			{invitesSent ? (
				<div className='flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4'>
					<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500'>
						<Send className='h-4 w-4' />
					</div>
					<div>
						<p className='text-sm font-bold text-slate-900 dark:text-zinc-50'>
							Invites sent! Your team is on its way.
						</p>
						<p className='text-xs text-slate-400'>
							They'll get a link to join your workspace straight in their inbox.
						</p>
					</div>
				</div>
			) : (
				<div className='space-y-4 pt-1'>
					{/* Email textarea */}
					<div className='space-y-2'>
						<label
							htmlFor='invite-emails'
							className='block text-xs font-bold text-slate-600 dark:text-zinc-400'>
							Work emails
							{hasValidEmails && (
								<span className='ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-black text-primary-600 dark:bg-primary-950/50 dark:text-primary-400'>
									{validInviteEmails.length} added
								</span>
							)}
						</label>
						<textarea
							id='invite-emails'
							rows={3}
							placeholder='maria@acme.com, jordan@acme.com'
							value={inviteEmails}
							onChange={(e) =>
								dispatch({
									type: 'SET_FIELD',
									payload: { inviteEmails: e.target.value },
								})
							}
							className='block w-full resize-none rounded-xl border border-slate-200/90 bg-white/50 px-4 py-3 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-100'
						/>
						<p className='text-[10px] text-slate-400'>
							Separate addresses with commas or new lines
						</p>
					</div>

					{/* Role selector */}
					<div className='space-y-2'>
						<label className='block text-xs font-bold text-slate-600 dark:text-zinc-400'>
							Default access level
						</label>
						<div className='grid grid-cols-2 gap-2'>
							{ROLE_OPTIONS.map((r) => (
								<button
									key={r.value}
									type='button'
									onClick={() =>
										dispatch({
											type: 'SET_FIELD',
											payload: { inviteRole: r.value as TWorkspaceRole },
										})
									}
									className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
										inviteRole === r.value
											? 'border-primary-500 bg-primary-400/5 ring-1 ring-primary-500/20'
											: 'border-slate-200 bg-white/40 hover:bg-slate-50 dark:border-zinc-800/80 dark:bg-zinc-950/20 dark:hover:bg-zinc-800/30'
									}`}>
									<span
										className={`text-xs font-bold ${inviteRole === r.value ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-zinc-100'}`}>
										{r.label}
									</span>
									<span className='mt-0.5 text-[10px] text-slate-400'>
										{r.description}
									</span>
								</button>
							))}
						</div>
					</div>

					{/* Invite message */}
					<div className='space-y-2'>
						<label
							htmlFor='invite-message'
							className='block text-xs font-bold text-slate-600 dark:text-zinc-400'>
							Personal note · shown in the invite email
							<span className='ml-1 font-medium text-slate-400'>(optional)</span>
						</label>
						<textarea
							id='invite-message'
							rows={2}
							value={inviteMessage}
							onChange={(e) =>
								dispatch({
									type: 'SET_FIELD',
									payload: { inviteMessage: e.target.value },
								})
							}
							className='block w-full resize-none rounded-xl border border-slate-200/90 bg-white/50 px-4 py-3 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-100'
						/>
					</div>
				</div>
			)}
		</>
	);
};

export default InviteTeamStep;
