import { useState } from 'react';
import { Check, Crown, Infinity, X, Zap } from 'lucide-react';
import { useWorkspaceContext } from '@/context/workspaceContext';
import { usePlans, useSubscription } from '@/api/modules/plans';
import { useBillingSwitch, useLifetimePlans } from '@/api/modules/billing';
import type { TBillingInterval, TPlanFeatures } from '@/types/billing.type';

const FEATURE_LABELS: Record<keyof TPlanFeatures, string> = {
	webhook_triggers: 'Webhook triggers',
	schedule_triggers: 'Schedule triggers',
	import_export: 'Import & export',
	custom_variables: 'Custom variables',
	ai_generation: 'AI generation',
	ai_autofix: 'AI autofix',
	deterministic_replay: 'Deterministic replay',
	execution_debugger: 'Execution debugger',
	priority_execution: 'Priority execution',
	environments: 'Environments',
	approval_workflows: 'Approval workflows',
	connector_metrics: 'Connector metrics',
	overage_protection: 'Overage protection',
	audit_logs: 'Audit logs',
	sso_saml: 'SSO / SAML',
	annual_rollover: 'Annual credit rollover',
	credit_packs: 'Credit pack top-ups',
};

function fmtLimit(val: number | null | undefined): string {
	if (val === null || val === undefined || val === -1) return '∞';
	return val.toLocaleString();
}

const PlanUpgradePage = () => {
	const { activeWorkspaceId } = useWorkspaceContext();
	const { data: plans, isLoading } = usePlans();
	const { data: subscription } = useSubscription(activeWorkspaceId);
	const { data: lifetimePlans } = useLifetimePlans(activeWorkspaceId);
	const switchPlan = useBillingSwitch(activeWorkspaceId);
	const [interval, setInterval] = useState<TBillingInterval>('monthly');

	const currentSlug = subscription?.plan?.slug;
	const currentInterval = subscription?.billing_interval;
	const isCurrentLifetime = subscription?.is_lifetime ?? false;
	const hasLifetimePlans = (lifetimePlans?.length ?? 0) > 0;

	if (isLoading) {
		return (
			<div className='space-y-4'>
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className='h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800'
					/>
				))}
			</div>
		);
	}

	return (
		<div className='space-y-8 text-zinc-950 dark:text-zinc-50'>
			{/* Header */}
			<div className='text-center'>
				<h1 className='text-3xl font-black tracking-tight sm:text-4xl'>Choose a Plan</h1>
				<p className='mt-2 text-base font-medium text-zinc-500 dark:text-zinc-400'>
					Upgrade or downgrade at any time. Cancel anytime.
				</p>

				{/* Interval toggle */}
				<div className='mt-6 inline-flex items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800'>
					{(['monthly', 'yearly'] as const).map((opt) => (
						<button
							key={opt}
							type='button'
							onClick={() => setInterval(opt)}
							className={[
								'rounded-xl px-5 py-2 text-sm font-bold transition-all',
								interval === opt
									? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
									: 'text-zinc-500 hover:text-zinc-700',
							].join(' ')}>
							{opt === 'monthly' ? 'Monthly' : 'Yearly'}
							{opt === 'yearly' && (
								<span className='ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'>
									Save 30%
								</span>
							)}
						</button>
					))}
				</div>
			</div>

			{/* Plan cards */}
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{plans?.map((plan) => {
					const isCurrent =
						plan.slug === currentSlug &&
						!isCurrentLifetime &&
						currentInterval === interval;
					const price = interval === 'yearly' ? plan.price_yearly : plan.price_monthly;
					const isEnterprise = plan.slug === 'enterprise';

					return (
						<div
							key={plan.id}
							className={[
								'relative flex flex-col rounded-2xl border p-6 shadow-sm transition',
								isCurrent
									? 'border-zinc-900 bg-zinc-950 text-white dark:border-zinc-200 dark:bg-white dark:text-zinc-950'
									: 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900',
							].join(' ')}>
							{isCurrent && (
								<span className='absolute top-4 right-4 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black dark:bg-black/20'>
									Current plan
								</span>
							)}

							<p
								className={`text-xs font-bold tracking-widest uppercase ${isCurrent ? 'text-white/60 dark:text-black/60' : 'text-zinc-400'}`}>
								{plan.description}
							</p>
							<h3 className='mt-1 text-xl font-black'>{plan.name}</h3>
							<div className='mt-3'>
								{isEnterprise ? (
									<span className='text-3xl font-black'>Custom</span>
								) : price === 0 ? (
									<span className='text-3xl font-black'>Free</span>
								) : (
									<>
										<span className='text-3xl font-black'>${price / 100}</span>
										<span
											className={`ml-1 text-sm ${isCurrent ? 'text-white/60 dark:text-black/60' : 'text-zinc-400'}`}>
											/mo
										</span>
									</>
								)}
							</div>

							{/* Key limits */}
							<ul
								className={`mt-4 space-y-1.5 border-t pt-4 text-sm ${isCurrent ? 'border-white/20 dark:border-black/20' : 'border-zinc-100 dark:border-zinc-800'}`}>
								<li className='flex items-center gap-2'>
									<Check
										size={14}
										className={
											isCurrent
												? 'text-white dark:text-zinc-950'
												: 'text-emerald-500'
										}
									/>
									{fmtLimit(plan.limits.credits_monthly)} credits/mo
								</li>
								<li className='flex items-center gap-2'>
									<Check
										size={14}
										className={
											isCurrent
												? 'text-white dark:text-zinc-950'
												: 'text-emerald-500'
										}
									/>
									{fmtLimit(plan.limits.active_workflows)} active workflows
								</li>
								<li className='flex items-center gap-2'>
									<Check
										size={14}
										className={
											isCurrent
												? 'text-white dark:text-zinc-950'
												: 'text-emerald-500'
										}
									/>
									{fmtLimit(plan.limits.members)} team members
								</li>
								<li className='flex items-center gap-2'>
									<Check
										size={14}
										className={
											isCurrent
												? 'text-white dark:text-zinc-950'
												: 'text-emerald-500'
										}
									/>
									{fmtLimit(plan.limits.execution_log_retention_days)}-day log
									retention
								</li>
							</ul>

							{/* CTA */}
							<div className='mt-6'>
								{isEnterprise ? (
									<a
										href='mailto:sales@agent1o1.com'
										className='flex w-full items-center justify-center rounded-xl border border-zinc-200 py-2.5 text-sm font-bold transition hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800'>
										Contact sales
									</a>
								) : isCurrent ? (
									<div className='flex w-full items-center justify-center rounded-xl border border-white/20 py-2.5 text-sm font-bold dark:border-black/20'>
										Current plan
									</div>
								) : (
									<button
										type='button'
										onClick={() =>
											switchPlan.mutate({
												plan_id: plan.id,
												interval,
											})
										}
										disabled={switchPlan.isPending}
										className='flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-sm font-black text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200'>
										<Zap size={14} />
										{switchPlan.isPending
											? 'Processing…'
											: price === 0
												? 'Downgrade'
												: 'Upgrade'}
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Lifetime plans section */}
			{hasLifetimePlans && (
				<section>
					<div className='mb-4 flex items-center gap-3'>
						<Crown size={18} className='text-amber-500' />
						<h3 className='text-lg font-black'>Lifetime Plans</h3>
						<span className='rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-700 dark:bg-amber-950 dark:text-amber-300'>
							One-time payment
						</span>
					</div>
					<p className='mb-5 text-sm text-zinc-500 dark:text-zinc-400'>
						Pay once, own it forever. No recurring charges, no credit card on file.
					</p>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{lifetimePlans?.map((lp) => {
							const isCurrentLifetimePlan =
								isCurrentLifetime && currentSlug === lp.plan_slug;
							return (
								<div
									key={lp.plan_slug}
									className={[
										'relative flex flex-col rounded-2xl border p-6 shadow-sm transition',
										isCurrentLifetimePlan
											? 'border-amber-400 bg-amber-950 text-white dark:border-amber-400'
											: 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900',
									].join(' ')}>
									{isCurrentLifetimePlan && (
										<span className='absolute top-4 right-4 rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-black text-amber-300'>
											Your plan
										</span>
									)}
									<div className='flex items-center gap-2'>
										<Crown size={15} className='text-amber-500' />
										<p className='text-xs font-bold tracking-widest text-amber-600 uppercase dark:text-amber-400'>
											Lifetime
										</p>
									</div>
									<h3 className='mt-1 text-xl font-black'>{lp.label}</h3>
									<div className='mt-3 flex items-baseline gap-1.5'>
										<span className='text-3xl font-black'>
											${(lp.price_cents / 100).toFixed(0)}
										</span>
										<span className='text-sm text-zinc-400'>one-time</span>
									</div>

									{/* Key limits */}
									<ul className='mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800'>
										<li className='flex items-center gap-2'>
											<Infinity size={14} className='text-amber-500' />
											{fmtLimit(lp.limits.credits_monthly)} credits/mo
										</li>
										<li className='flex items-center gap-2'>
											<Infinity size={14} className='text-amber-500' />
											Never expires
										</li>
										{lp.features.annual_rollover && (
											<li className='flex items-center gap-2'>
												<Check size={14} className='text-emerald-500' />
												Annual rollover included
											</li>
										)}
									</ul>

									{/* CTA */}
									<div className='mt-6'>
										{isCurrentLifetimePlan ? (
											<div className='flex w-full items-center justify-center rounded-xl border border-amber-500/30 py-2.5 text-sm font-bold text-amber-400'>
												Your current plan
											</div>
										) : !lp.available ? (
											<div className='flex w-full items-center justify-center rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-400 dark:border-zinc-700'>
												Not available
											</div>
										) : (
											<button
												type='button'
												onClick={() =>
													switchPlan.mutate({
														plan_id:
															plans?.find(
																(p) => p.slug === lp.plan_slug,
															)?.id ?? lp.plan_slug,
														interval: 'lifetime',
													})
												}
												disabled={switchPlan.isPending}
												className='flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-black text-white transition hover:bg-amber-600 disabled:opacity-60'>
												<Crown size={14} />
												{switchPlan.isPending
													? 'Processing…'
													: 'Get lifetime access'}
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</section>
			)}

			{/* Full feature comparison table */}
			{plans && plans.length > 0 && (
				<section>
					<h3 className='mb-4 text-lg font-black'>Full Feature Comparison</h3>
					<div className='overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700'>
						<table className='w-full min-w-[640px] text-sm'>
							<thead>
								<tr className='border-b border-zinc-100 dark:border-zinc-800'>
									<th className='px-5 py-3.5 text-left text-xs font-bold tracking-widest text-zinc-400 uppercase'>
										Feature
									</th>
									{plans.map((p) => (
										<th
											key={p.id}
											className={`px-4 py-3.5 text-center text-xs font-black tracking-widest uppercase ${p.slug === currentSlug ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-400'}`}>
											{p.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{(Object.keys(FEATURE_LABELS) as (keyof TPlanFeatures)[]).map(
									(key) => (
										<tr
											key={key}
											className='border-b border-zinc-100 last:border-0 dark:border-zinc-800'>
											<td className='px-5 py-3 font-medium text-zinc-700 dark:text-zinc-300'>
												{FEATURE_LABELS[key]}
											</td>
											{plans.map((p) => (
												<td key={p.id} className='px-4 py-3 text-center'>
													{p.features[key] ? (
														<Check
															size={16}
															className='mx-auto text-emerald-500'
														/>
													) : (
														<X
															size={16}
															className='mx-auto text-zinc-300 dark:text-zinc-600'
														/>
													)}
												</td>
											))}
										</tr>
									),
								)}
							</tbody>
						</table>
					</div>
				</section>
			)}
		</div>
	);
};

export default PlanUpgradePage;
