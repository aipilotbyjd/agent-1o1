/**
 * Workflow Share Types
 * Matches Laravel WorkflowShareResource
 */

export interface IWorkflowShare {
	id: string;
	workflow_id: string;
	share_token: string;
	share_url: string;
	is_public: boolean;
	allow_clone: boolean;
	has_password: boolean;
	expires_at: string | null;
	is_expired: boolean;
	view_count: number;
	clone_count: number;
	shared_by?: {
		id: string;
		name: string;
		email: string;
		avatar: string | null;
	};
	created_at: string;
	updated_at: string;
}

// POST /workspaces/{id}/workflows/{id}/shares
export interface ICreateShareDto {
	is_public?: boolean;
	allow_clone?: boolean;
	password?: string;
	expires_at?: string;
}

// PUT /workspaces/{id}/workflows/{id}/shares/{id}
export interface IUpdateShareDto {
	is_public?: boolean;
	allow_clone?: boolean;
	password?: string | null;
	expires_at?: string | null;
}

// POST /workspaces/{id}/shared/{token}/clone
export interface IClonePublicShareDto {
	password?: string;
}

// View public share response data shape
export interface IPublicShareView {
	workflow: import('./workflow.type').TWorkflow;
	allow_clone: boolean;
}
