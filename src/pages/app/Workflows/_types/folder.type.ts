// Folder entity for organizing workflows
export interface IFolder {
	id: string;
	name: string;
	color: string;
	icon: string;
	workspace_id: string;
	parent_id: string | null;
	workflow_count: number;
	created_at: number;
	updated_at: number;
}

// Create folder request
export interface ICreateFolderDto {
	name: string;
	color?: string;
	icon?: string;
	parent_id?: string;
}

// Update folder request
export interface IUpdateFolderDto {
	name?: string;
	color?: string;
	icon?: string;
	parent_id?: string;
}

// Folder colors
export const FOLDER_COLORS = [
	{ value: 'bg-blue-500', label: 'Blue' },
	{ value: 'bg-emerald-500', label: 'Green' },
	{ value: 'bg-violet-500', label: 'Purple' },
	{ value: 'bg-amber-500', label: 'Yellow' },
	{ value: 'bg-red-500', label: 'Red' },
	{ value: 'bg-pink-500', label: 'Pink' },
	{ value: 'bg-cyan-500', label: 'Cyan' },
	{ value: 'bg-orange-500', label: 'Orange' },
] as const;

// Folder icons
export const FOLDER_ICONS = [
	{ value: 'Folder02', label: 'Folder' },
	{ value: 'Mail01', label: 'Mail' },
	{ value: 'UserAdd01', label: 'Users' },
	{ value: 'Link01', label: 'Link' },
	{ value: 'Analytics01', label: 'Analytics' },
	{ value: 'Settings02', label: 'Settings' },
	{ value: 'Code', label: 'Code' },
	{ value: 'Api', label: 'API' },
] as const;
