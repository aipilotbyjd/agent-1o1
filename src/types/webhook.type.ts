export type TWebhook = {
	id: string;
	name: string;
	path: string;
	url: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	workflow_id: string;
	workflow_name?: string;
	is_active: boolean;
	authentication: 'none' | 'basic' | 'header' | 'query';
	auth_config?: Record<string, unknown>;
	response_mode: 'first_node' | 'last_node' | 'all_nodes';
	response_data?: string;
	timeout: number;
	calls_count: number;
	last_called_at?: number;
	created_at: number;
	updated_at: number;
};

export type TWebhookLog = {
	id: string;
	webhook_id: string;
	method: string;
	headers: Record<string, string>;
	query_params: Record<string, unknown>;
	body: unknown;
	response_status: number;
	response_body: unknown;
	execution_id?: string;
	ip_address: string;
	user_agent: string;
	created_at: number;
};

export type TWebhookSortBy = 'name' | 'created_at' | 'updated_at' | 'calls_count';
export type TSortOrder = 'asc' | 'desc';
