export type TBillingCheckoutDto = {
	plan_id: string;
	interval: TBillingInterval;
};

export type TBillingSwitchDto = {
	plan_id: string;
	interval: TBillingInterval | 'lifetime';
};

export type TBillingSwitchUrlResponse = {
	url: string;
	trial_days?: number;
};

export type TBuyCreditsDto = {
	price_id: string;
};

export type TBillingUrlResponse = {
	url: string;
};

export type TLifetimePlan = {
	plan_slug: string;
	plan_name: string;
	label: string;
	price_cents: number;
	available: boolean;
	limits: TPlanLimits;
	features: TPlanFeatures;
};

export type TSubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';

export type TBillingInterval = 'monthly' | 'yearly';

export type TBillingIntervalFull = TBillingInterval | 'lifetime';

export type TPlanLimits = {
	active_workflows: number; // -1 = unlimited
	members: number; // -1 = unlimited
	credits_monthly: number; // -1 = unlimited
	min_schedule_interval_minutes: number | null;
	max_execution_time_seconds: number; // -1 = unlimited
	execution_log_retention_days: number;
	api_rate_limit_per_minute: number; // -1 = unlimited
};

export type TPlanFeatures = {
	webhook_triggers: boolean;
	schedule_triggers: boolean;
	import_export: boolean;
	custom_variables: boolean;
	ai_generation: boolean;
	ai_autofix: boolean;
	deterministic_replay: boolean;
	execution_debugger: boolean;
	priority_execution: boolean;
	environments: boolean;
	approval_workflows: boolean;
	connector_metrics: boolean;
	overage_protection: boolean;
	audit_logs: boolean;
	sso_saml: boolean;
	annual_rollover: boolean;
	credit_packs: boolean;
};

export type TPlan = {
	id: string;
	name: string;
	slug: string;
	description: string;
	price_monthly: number;
	price_yearly: number;
	limits: TPlanLimits;
	features: TPlanFeatures;
	sort_order: number;
};

export type TSubscription = {
	id: string;
	status: TSubscriptionStatus;
	billing_interval: TBillingInterval;
	is_lifetime: boolean;
	credits_monthly: number;
	current_period_start: string | null;
	current_period_end: string | null;
	trial_ends_at: string | null;
	canceled_at: string | null;
	plan: TPlan | null;
};
