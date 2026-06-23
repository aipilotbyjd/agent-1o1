export interface IEnvironment {
	id: string;
	name: string;
	slug: string;
	variables: Record<string, string>;
	created_at: string;
	updated_at: string;
}

export interface ICreateEnvironmentDto {
	name: string;
	slug: string;
	variables?: Record<string, string>;
}

export interface IUpdateEnvironmentDto {
	name?: string;
	variables?: Record<string, string>;
}
