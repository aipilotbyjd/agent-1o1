export type TVariableScope = 'Global' | 'Local';

export interface IVariable {
	id: string;
	key: string;
	value: string;
	scope: TVariableScope;
	is_secret: boolean;
	description?: string;
	created_by?: string;
	created_at: number;
	updated_at: number;
}

export interface ICreateVariableDto {
	key: string;
	value: string;
	scope?: TVariableScope;
	is_secret?: boolean;
	description?: string;
}

export interface IUpdateVariableDto {
	key?: string;
	value?: string;
	scope?: TVariableScope;
	is_secret?: boolean;
	description?: string;
}

export interface IResolvedVariable {
	name: string;
	value: string;
	is_secret?: boolean;
}

export type TVariableSortBy = 'key' | 'created_at' | 'updated_at';
export type TSortOrder = 'asc' | 'desc';

export interface IVariableFilters {
	search?: string;
	is_secret?: boolean;
	sort_by?: TVariableSortBy;
	order?: TSortOrder;
	page?: number;
	per_page?: number;
}
