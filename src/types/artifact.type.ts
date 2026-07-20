export type TArtifact = {
	id: string;
	group_id: string;
	version: number;
	filename: string;
	mime_type: string;
	size: number;
	agent: {
		id: string;
		name: string;
	};
	preview_url?: string | null;
	versions_count?: number;
	versions?: { id: string; version: number; size: number; created_at: string }[];
	created_at: string;
	updated_at: string;
};

export type TArtifactMimeCategory = 'images' | 'documents' | 'spreadsheets';

export type TArtifactFilters = {
	search?: string;
	agent_id?: string;
	mime_category?: TArtifactMimeCategory;
	page?: number;
	per_page?: number;
};
