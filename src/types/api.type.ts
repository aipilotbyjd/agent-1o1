/**
 * Common API Types
 * Matches the Laravel 12 backend response shapes
 */

// Standard API response wrapper from Laravel backend
export type TApiResponse<T> = {
	success: boolean;
	statusCode: number;
	message: string;
	data: T;
};

// Paginated response from Laravel
export type TPaginatedResponse<T> = {
	data: T[];
	meta?: TPaginationMeta;
	pagination?: TPaginationMeta & {
		from?: number | null;
		to?: number | null;
	};
};

// Pagination meta from backend
export type TPaginationMeta = {
	current_page: number;
	total: number;
	per_page?: number;
	last_page?: number;
};

// List / pagination query params
export type TListParams = {
	page?: number;
	per_page?: number;
	search?: string;
	sort?: string;
	order?: 'asc' | 'desc';
	status?: string;
	[key: string]: unknown;
};

// API Error — actual backend shape
export type TApiError = {
	success: false;
	statusCode: number;
	message: string;
	errors?: Record<string, string[]>;
};

// Simple message response
export type TMessageResponse = {
	success: boolean;
	statusCode: number;
	message: string;
};

// Common status values used across entities
export type TStatus = 'active' | 'inactive' | 'pending' | 'archived';

// Timestamps — ISO 8601 strings from Laravel
export type TTimestamps = {
	created_at: string;
	updated_at?: string;
};

// Generic ID type
export type TId = string;

// Pagination params (legacy alias compatible with older feature code)
export type IPaginationParams = {
	page?: number;
	per_page?: number;
	search?: string;
	sort?: string;
	order?: 'asc' | 'desc';
};

// Timestamps + creator/updater metadata (used by notes, tags, etc.)
export interface IWithActions {
	created_at: number;
	updated_at: number;
	created_by?: string;
	updated_by?: string;
}
