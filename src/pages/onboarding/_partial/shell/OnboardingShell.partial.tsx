import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingProvider from '../../_context/OnboardingProvider.context';
import { useOnboardingStore } from '../../_context/OnboardingStore.context';
import { TOTAL_STEPS, ROLES } from '../../_helper/onboarding.constants';
import { parseEmails, isValidEmail } from '../../_helper/onboarding.helper';
import { useOnboardingNavigation } from '../../_hooks/useOnboardingNavigation.hook';
import { useOnboardingSubmit } from '../../_hooks/useOnboardingSubmit.hook';
import StepIndicator from './StepIndicator.partial';
import NavigationBar from './NavigationBar.partial';
import ConnectAppModal from './ConnectAppModal.partial';
import OrbitAnimation from '../shared/OrbitAnimation.partial';
import ProfileStep from '../steps/ProfileStep.partial';
import WorkspaceStep from '../steps/WorkspaceStep.partial';
import InviteTeamStep from '../steps/InviteTeamStep.partial';
import RoleSelectionStep from '../steps/RoleSelectionStep.partial';
import PlanSelectionStep from '../steps/PlanSelectionStep.partial';
import ConnectAppsStep from '../steps/ConnectAppsStep.partial';
import DiscoveryStep from '../steps/DiscoveryStep.partial';

import { useOnboardingState } from '@/api/modules/onboarding';
import { useEffect } from 'react';
import type { TOnboardingStep } from '../../_types/onboarding.type';

const mapStepKeyToIndex = (key: string): TOnboardingStep => {
	switch (key) {
		case 'profile_picture': return 0;
		case 'create_workspace': return 1;
		case 'invite_team': return 2;
		case 'role_selection': return 3;
		case 'choose_plan': return 4;
		case 'connect_apps': return 5;
		case 'discovery_survey': return 6;
		default: return 0;
	}
};

const OnboardingShellInner = () => {
	const { state, dispatch } = useOnboardingStore();
	const { data: onboardingData, isLoading } = useOnboardingState();
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (onboardingData && !initialized) {
			const stepIndex = mapStepKeyToIndex(onboardingData.current_step);
			dispatch({ type: 'SET_STEP', payload: stepIndex });
			dispatch({
				type: 'SET_FIELD',
				payload: {
					workspaceSlug: onboardingData.meta.workspace_slug_suggestion,
					workspaceInput: onboardingData.meta.workspace_slug_suggestion,
				},
			});
			setInitialized(true);
		}
	}, [onboardingData, initialized, dispatch]);

	const {
		currentStep: step,
		selectedRoleIndex,
		selectedPlan,
		connectedApps,
		inviteEmails,
		invitesSent,
		workspaceName,
		workspaceCreated,
	} = state;

	// Local UI state that isn't part of the global onboarding data
	const [workspaceError, setWorkspaceError] = useState('');
	const [workspaceSlugTouched, setWorkspaceSlugTouched] = useState(false);

	const { handlePrevStep, handleSkip, handleDismissAll } = useOnboardingNavigation();
	const { handleNextStep, isWorkspaceLoading, sendInvitationPending } = useOnboardingSubmit();

	const isDualColumn = step >= 1;
	const isLastStep = step === TOTAL_STEPS - 1;

	const parsedInviteEmails = parseEmails(inviteEmails);
	const validInviteEmails = parsedInviteEmails.filter(isValidEmail);
	const hasValidEmails = validInviteEmails.length > 0;

	const isContinueDisabled =
		step === 1 && !workspaceCreated && (!workspaceName.trim() || isWorkspaceLoading);

	const currentOrbitIcons = useMemo(() => {
		if (step === 1) return ['slack', 'notion', 'github', 'google drive', 'gmail'];
		if (step === 2) return ['slack', 'gmail', 'notion', 'github'];
		if (step === 3) {
			if (selectedRoleIndex === null) return ['slack', 'github', 'gmail'];
			return ROLES[selectedRoleIndex].apps;
		}
		if (step === 4) return ['slack', 'github', 'notion', 'google drive', 'figma'];
		if (step === 5) return connectedApps.map((a) => a.toLowerCase());
		if (step === 6)
			return connectedApps.length > 0
				? connectedApps.map((a) => a.toLowerCase())
				: ['slack', 'github', 'gmail', 'notion'];
		return ['slack', 'github', 'gmail'];
	}, [step, selectedRoleIndex, connectedApps]);

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50/80 via-slate-50/90 to-rose-50/80 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950'>
				<div className='flex flex-col items-center gap-4'>
					<div className='flex h-16 w-16 animate-pulse items-center justify-center rounded-[2rem] bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'>
						<span className='text-xl font-extrabold tracking-tighter'>A1</span>
					</div>
					<div className='text-sm font-semibold text-slate-500 dark:text-zinc-400'>Loading your onboarding...</div>
				</div>
			</div>
		);
	}

	return (
		<main className='relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-gradient-to-br from-indigo-50/80 via-slate-50/90 to-rose-50/80 text-slate-950 transition-colors duration-300 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:text-zinc-50'>
			{/* Animated background blobs */}
			<div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
				<div className='absolute top-0 right-0 left-0 h-[500px] bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.15),transparent_45%),radial-gradient(circle_at_top_right,rgba(244,63,94,0.15),transparent_45%)]' />
				<div
					className='absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse rounded-full bg-violet-400/30 blur-[120px] dark:bg-violet-900/15'
					style={{ animationDuration: '8s' }}
				/>
				<div
					className='absolute -right-40 -bottom-40 h-[600px] w-[600px] animate-pulse rounded-full bg-orange-400/30 blur-[120px] dark:bg-amber-900/15'
					style={{ animationDuration: '12s' }}
				/>
				<div
					className='absolute top-1/2 left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-rose-400/20 blur-[100px]'
					style={{ animationDuration: '10s' }}
				/>
			</div>

			<header className='relative z-10 w-full px-6 py-5'>
				<div className='mx-auto flex max-w-7xl items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'>
							<span className='text-base font-extrabold tracking-tighter'>A1</span>
						</div>
						<span className='bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 bg-clip-text text-xl font-black text-transparent dark:from-white dark:via-zinc-200 dark:to-zinc-100'>
							Agent1o1
						</span>
					</div>
					<button
						type='button'
						onClick={handleDismissAll}
						className='text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors'
					>
						Skip Onboarding
					</button>
				</div>
			</header>

			{/* Main Wizard Card */}
			<section className='relative z-10 flex flex-1 items-center justify-center px-4 py-8 md:py-16'>
				<motion.div
					layout
					transition={{ type: 'spring', stiffness: 220, damping: 26 }}
					style={{ maxWidth: isDualColumn ? '1024px' : '480px' }}
					className='w-full overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95'>
					<div className={`grid ${isDualColumn ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
						{/* Left: Form */}
						<div className='flex min-h-[520px] flex-col justify-between p-6 md:p-10'>
							<div>
								{/* Step indicator */}
								<StepIndicator step={step} />

								<AnimatePresence mode='wait'>
									<motion.div
										key={step}
										initial={{ opacity: 0, x: -15 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 15 }}
										transition={{ duration: 0.25 }}
										className='space-y-6'>
										{step === 0 && <ProfileStep />}
										{step === 1 && (
											<WorkspaceStep
												workspaceError={workspaceError}
												setWorkspaceError={setWorkspaceError}
												workspaceSlugTouched={workspaceSlugTouched}
												setWorkspaceSlugTouched={setWorkspaceSlugTouched}
											/>
										)}
										{step === 2 && <InviteTeamStep />}
										{step === 3 && <RoleSelectionStep />}
										{step === 4 && <PlanSelectionStep />}
										{step === 5 && <ConnectAppsStep />}
										{step === 6 && <DiscoveryStep />}
									</motion.div>
								</AnimatePresence>
							</div>

							{/* Footer navigation */}
							<NavigationBar
								step={step}
								isLastStep={isLastStep}
								isContinueDisabled={isContinueDisabled}
								isWorkspaceLoading={isWorkspaceLoading}
								sendInvitationPending={sendInvitationPending}
								hasValidEmails={hasValidEmails}
								invitesSent={invitesSent}
								selectedPlan={selectedPlan}
								onPrev={handlePrevStep}
								onSkip={handleSkip}
								onNext={handleNextStep}
							/>
						</div>

						{/* Right: Animated Orbit Panel */}
						{isDualColumn && (
							<OrbitAnimation
								step={step}
								currentOrbitIcons={currentOrbitIcons}
								selectedRoleIndex={selectedRoleIndex}
								selectedPlan={selectedPlan}
								connectedApps={connectedApps}
							/>
						)}
					</div>
				</motion.div>
			</section>

			{/* App Auth Modal */}
			<ConnectAppModal />

			<footer className='relative z-10 w-full py-6 text-center text-[10px] font-bold text-slate-400 dark:text-zinc-600'>
				© {new Date().getFullYear()} Agent1o1. Built with premium micro-interactions.
			</footer>
		</main>
	);
};

const OnboardingShell = () => (
	<OnboardingProvider>
		<OnboardingShellInner />
	</OnboardingProvider>
);

export default OnboardingShell;
