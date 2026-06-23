import type { TListParams } from './api.type';

export type TActivityLog = {
	id: string;
	workspace_id: string;
	user_id: string | null;
	user_name?: string;
	action: string;
	entity_type: string;
	entity_id: string;
	entity_name?: string;
	metadata: Record<string, unknown>;
	ip_address: string | null;
	user_agent: string | null;
	created_at: string;
};

export type TActivityLogFilters = TListParams & {
	user_id?: string;
	action?: string;
	entity_type?: string;
	from?: string;
	to?: string;
};

export type TActivityLogExportFormat = 'csv' | 'json';
