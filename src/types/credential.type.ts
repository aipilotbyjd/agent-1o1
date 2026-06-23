export const MASKED_CREDENTIAL_VALUE = '___MASKED___' as const;

export type TCredentialType = string;
export type TSharingScope = 'private' | 'workspace' | 'specific';
export type TCredentialDataValue = string | number | boolean | null;
export type TCredentialData = Record<string, TCredentialDataValue>;

export interface IUserSummary {
	id: string;
	email: string;
	name?: string;
	first_name?: string;
	last_name?: string;
	avatar?: string | null;
}

export interface ICredentialShare {
	id: string;
	user_id: string;
	user?: IUserSummary;
	permission: 'use';
	shared_by: string;
	created_at: number;
}

export interface ICredential {
	id: string;
	workspace_id?: string;
	created_by?: string;
	name: string;
	type: TCredentialType;
	data?: TCredentialData;
	description?: string;
	provider?: string;
	provider_account_id?: string;
	token_expires_at?: string | number | null;
	expires_at?: string | null;
	creator?: IUserSummary;
	is_shared?: boolean;
	sharing_scope?: TSharingScope;
	is_owner?: boolean;
	can_edit?: boolean;
	can_share?: boolean;
	shares?: ICredentialShare[];
	last_used_at?: string | null;
	created_at: string;
	updated_at: string;
}

export interface ICredentialDetail extends ICredential {
	data: TCredentialData;
}

export type ICreateCredentialDto = {
	name: string;
	data: TCredentialData;
	expires_at?: string | null;
} & (
	| { credential_type_id: string; type?: never }
	| { type: TCredentialType; credential_type_id?: never }
);

export interface IUpdateCredentialDto {
	name?: string;
	data?: TCredentialData;
	expires_at?: string | null;
}

export interface IShareCredentialDto {
	is_shared: boolean;
}

export interface IUpdateSharingScopeDto {
	sharing_scope: TSharingScope;
}

export interface IOAuthProvider {
	id: string;
	name: string;
	configured: boolean;
	scopes: string[];
}

export interface IOAuthAuthResponse {
	authorization_url: string;
	state_token: string;
}

export interface IStartOAuthDto {
	credential_type: string;
	credential_id?: string | null;
}

export interface IOAuthResult {
	success: boolean;
	credentialId: string | null;
	credentialType: string | null;
	stateToken?: string | null;
	error?: string | null;
}

export type TCredentialSortBy = 'name' | 'created_at' | 'type' | 'last_used_at';
export type TSortOrder = 'asc' | 'desc';

export interface ICredentialFilters {
	type?: TCredentialType;
	search?: string;
	sort?: TCredentialSortBy;
	direction?: TSortOrder;
	page?: number;
	per_page?: number;
}
