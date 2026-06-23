export type TPollingTriggerStatus = 'idle' | 'polling' | 'failed' | 'paused';

export type TPollingTrigger = {
	id: string;
	workflow_id: string;
	workflow_name?: string;
	name: string;
	interval_seconds: number;
	config: Record<string, unknown>;
	is_active: boolean;
	status: TPollingTriggerStatus;
	last_polled_at: string | null;
	next_poll_at: string | null;
	last_error: string | null;
	created_at: string;
	updated_at: string;
};

export type TUpdatePollingTriggerDto = Partial<{
	name: string;
	interval_seconds: number;
	config: Record<string, unknown>;
	is_active: boolean;
}>;
