import { Check, Zap, Sparkles, Crown } from 'lucide-react';
import { useOnboardingStore } from '../../_context/OnboardingStore.context';
import { PLANS } from '../../_helper/onboarding.constants';

const PlanSelectionStep = () => {
	const { state, dispatch } = useOnboardingStore();
	const { selectedPlan } = state;

	return (
		<>
			<div>
				<h1 className='text-3xl leading-tight font-extrabold tracking-tight text-slate-950 dark:text-zinc-50'>
					Pick your pace
				</h1>
				<p className='mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400'>
					Every plan includes full access to agents and workflows. Upgrade or downgrade
					whenever you're ready.
				</p>
			</div>

			<div className='space-y-3'>
				{PLANS.map((plan) => {
					const isSelected = selectedPlan === plan.id;
					const PlanIcon =
						plan.id === 'free' ? Zap : plan.id === 'pro' ? Sparkles : Crown;
					return (
						<button
							key={plan.id}
							type='button'
							onClick={() =>
								dispatch({ type: 'SET_FIELD', payload: { selectedPlan: plan.id } })
							}
							className={`relative flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
								isSelected
									? 'border-violet-500 bg-violet-500/5 ring-1 ring-violet-500/20'
									: plan.highlighted
										? 'border-violet-200 bg-white/40 hover:bg-slate-50 dark:border-violet-900/50 dark:bg-zinc-950/20 dark:hover:bg-zinc-800/30'
										: 'border-slate-200 bg-white/40 hover:bg-slate-50 dark:border-zinc-800/80 dark:bg-zinc-950/20 dark:hover:bg-zinc-800/30'
							}`}>
							{plan.badge && (
								<span className='absolute -top-2.5 left-4 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-black text-white'>
									{plan.badge}
								</span>
							)}

							{/* Radio */}
							<div
								className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? 'border-violet-500 bg-violet-500' : 'border-slate-300 dark:border-zinc-600'}`}>
								{isSelected && (
									<div className='h-1.5 w-1.5 rounded-full bg-white' />
								)}
							</div>

							{/* Icon */}
							<div
								className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${isSelected ? 'border-violet-300 bg-violet-500/10 text-violet-600 dark:border-violet-800 dark:text-violet-400' : 'border-slate-200 text-slate-400 dark:border-zinc-800'}`}>
								<PlanIcon className='h-4 w-4' />
							</div>

							{/* Content */}
							<div className='min-w-0 flex-1'>
								<div className='flex items-baseline gap-1.5'>
									<span
										className={`text-sm font-black ${isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-zinc-100'}`}>
										{plan.name}
									</span>
									<span className='text-base font-black text-slate-900 dark:text-zinc-100'>
										{plan.price}
									</span>
									<span className='text-[10px] text-slate-400'>
										{plan.period}
									</span>
								</div>
								<ul className='mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5'>
									{plan.features.map((f) => (
										<li
											key={f}
											className='flex items-center gap-1 text-[10px] text-slate-500 dark:text-zinc-400'>
											<Check className='h-2.5 w-2.5 shrink-0 text-emerald-500' />
											{f}
										</li>
									))}
								</ul>
							</div>
						</button>
					);
				})}
			</div>

			<p className='text-[10px] text-slate-400'>
				No credit card required to get started. Switch plans any time from your settings.
			</p>
		</>
	);
};

export default PlanSelectionStep;
