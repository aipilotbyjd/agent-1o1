import { IWithActions, IPaginationParams } from './api.type';

// Note position on canvas
export interface INotePosition {
	x: number;
	y: number;
}

// Note size
export interface INoteSize {
	width: number;
	height: number;
}

// Note colors
export type TNoteColor =
	| 'yellow'
	| 'blue'
	| 'green'
	| 'red'
	| 'purple'
	| 'orange'
	| 'pink'
	| 'gray';

// Resource types that can have notes
export type TNoteResourceName = 'workflow' | 'execution';

// Note entity (from API)
export interface INote extends IWithActions {
	id: string;
	workspace_id: string;
	resource_id: string;
	resource_name: TNoteResourceName;
	created_by: string;
	content: string;
	position: INotePosition;
	size: INoteSize;
	color: TNoteColor;
	created_at: number;
	updated_at: number;
}

// Note filters for list query
export interface INoteFilters extends IPaginationParams {
	resource_id?: string;
	resource_name?: TNoteResourceName;
	color?: TNoteColor;
	search?: string;
	sort_by?: 'created_at' | 'updated_at';
	order?: 'asc' | 'desc';
}

// Create note request
export interface ICreateNoteDto {
	resource_id: string;
	resource_name: TNoteResourceName;
	content: string;
	position?: INotePosition;
	size?: INoteSize;
	color?: TNoteColor;
}

// Update note request
export interface IUpdateNoteDto {
	content?: string;
	position?: INotePosition;
	size?: INoteSize;
	color?: TNoteColor;
}
