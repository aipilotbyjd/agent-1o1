export type TTemplateCategory =
	| 'Marketing'
	| 'Sales'
	| 'HR'
	| 'Finance'
	| 'Development'
	| 'Support'
	| 'Social Media'
	| 'E-commerce'
	| 'Productivity'
	| 'Other';

export interface ITemplateIntegration {
	id: string;
	name: string;
	icon: string;
}

export interface ITemplatePublisher {
	id: string;
	name: string;
	avatar?: string;
	verified?: boolean;
}

export interface IRequiredCredential {
	service_id: string;
	service_name: string;
	icon: string;
	description?: string;
}

export interface ITemplate {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	category: string;
	icon: string | null;
	color: string | null;
	tags: string[];
	trigger_type: string | null;
	thumbnail_url: string | null;
	instructions: string | null;
	required_credentials: string[];
	is_featured: boolean;
	usage_count: number;
	created_at: string;
	updated_at: string;
}

export interface ITemplateDetail extends ITemplate {
	nodes?: unknown[];
	edges?: unknown[];
	viewport?: { x: number; y: number; zoom: number };
	settings?: Record<string, unknown>;
	workflow_json?: {
		nodes?: unknown[];
		edges?: unknown[];
		viewport?: { x: number; y: number; zoom: number };
		settings?: Record<string, unknown>;
	};
}

export type TTemplateSortBy = 'name' | 'created_at' | 'used_count' | 'category';
export type TSortOrder = 'asc' | 'desc';

export interface ITemplateFilters {
	category?: TTemplateCategory | string;
	search?: string;
	integration?: string;
	sort_by?: TTemplateSortBy;
	order?: TSortOrder;
	is_featured?: boolean;
	page?: number;
	per_page?: number;
}

export interface IAgentTemplate {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	category: string;
	icon: string | null;
	color: string | null;
	tags: string[];
	avatar_url: string | null;
	llm_provider: string;
	llm_model: string;
	instructions: string | null;
	is_featured: boolean;
	usage_count: number;
	// Only on show route:
	system_prompt?: string;
	llm_settings?: {
		temperature: number;
		max_tokens: number;
		max_steps: number;
		timeout_seconds: number;
	};
	tool_configs?: Array<{
		type: string;
		name: string;
		description: string;
	}>;
	example_conversations?: Array<{
		user: string;
		assistant: string;
	}>;
	created_at: string;
	updated_at: string;
}

export interface ICollectionItem {
	type: 'workflow' | 'agent';
	template_id: string;
	note: string | null;
}

export interface ITemplateCollection {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	icon: string | null;
	color: string | null;
	thumbnail_url: string | null;
	items: ICollectionItem[];
	item_count: number;
	is_featured: boolean;
	usage_count: number;
	created_at: string;
	updated_at: string;
}
