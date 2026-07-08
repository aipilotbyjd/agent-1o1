/**
 * Workspace Types
 * Matches Laravel backend from docs/frontend/modules/02-workspace-management.md
 */

export type TWorkspaceRole = 'owner' | 'admin' | 'editor' | 'member' | 'viewer';

// Workspace entity — as returned by GET /api/v1/workspaces
export type TWorkspace = {
	id: string;
	name: string;
	slug: string;
	role?: TWorkspaceRole;
	logo?: string | null;
	settings?: TWorkspaceSettings | null;
	owner?: {
		id: string;
		name: string;
		email: string;
		avatar: string | null;
	};
	member_count?: number;
	workflows_count?: number;
	agents_count?: number;
	created_at: string;
};

// Workspace detail — as returned by GET /api/v1/workspaces/{id}
export type TWorkspaceDetail = TWorkspace & {
	settings: TWorkspaceSettings | null;
	members_count: number;
	workflows_count: number;
};

export type TWorkspaceSettings = {
	id?: string;
	workspace_id?: string;
	timezone: string | null;
	execution_retention_days: number | null;
	default_max_retries: number | null;
	default_timeout_seconds: number | null;
	auto_activate_workflows: boolean;
	allow_public_sharing: boolean;
	error_workflow_id: string | null;
	allowed_ip_ranges: string[];
	notification_preferences: Record<string, boolean> | null;
	git_repo_url: string | null;
	git_branch: string | null;
	git_auto_sync: boolean;
	last_git_sync_at: string | null;
	created_at?: string;
	updated_at?: string;
};

// Workspace member — as returned by GET /workspaces/{id}/members
export type TWorkspaceMember = {
	id: string;
	user_id: string;
	name: string;
	email: string;
	avatar: string | null;
	role: TWorkspaceRole;
	joined_at: string;
	last_active_at?: string;
	workflows_created?: number;
	executions_run?: number;
};

// Workspace invitation — as returned by GET /workspaces/{id}/invitations
export type TWorkspaceInvitation = {
	id: string;
	email: string;
	role: TWorkspaceRole;
	invited_by: string;
	status: 'pending' | 'accepted' | 'declined' | 'expired';
	expires_at: string;
	created_at: string;
};

// ─── Request DTOs ────────────────────────────────────────────

// POST /workspaces
export type TCreateWorkspaceDto = {
	name: string;
	slug?: string;
};

// PUT /workspaces/{id}
export type TUpdateWorkspaceDto = {
	name?: string;
	settings?: Partial<TWorkspaceSettings>;
};

// PUT /workspaces/{id}/members/{user}
export type TUpdateMemberRoleDto = {
	role: TWorkspaceRole;
};

// POST /workspaces/{id}/invitations
export type TSendInvitationDto = {
	email: string;
	role: TWorkspaceRole;
	message?: string;
};

// Response from GET /api/v1/workspaces
export type TWorkspacesPaginatedResponse = {
	success: boolean;
	statusCode: number;
	message: string;
	data: TWorkspace[];
	meta?: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
	pagination?: {
		total: number;
		per_page: number;
		current_page: number;
		last_page: number;
		from: number | null;
		to: number | null;
	};
};
