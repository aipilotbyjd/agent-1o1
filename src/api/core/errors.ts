/**
 * Typed error class for all API failures.
 * The normalize-error interceptor rejects with an instance of this class.
 */
export class ApiError extends Error {
	constructor(
		public readonly status: number | undefined,
		message: string,
		public readonly fields?: Record<string, string[]>,
	) {
		super(message);
		this.name = 'ApiError';
	}

	/** First validation message for a specific field (Laravel 422). */
	field(name: string): string | undefined {
		return this.fields?.[name]?.[0];
	}

	/** All validation errors as flat field → first-message map. */
	fieldErrors(): Record<string, string> {
		if (!this.fields) return {};
		const result: Record<string, string> = {};
		for (const [field, messages] of Object.entries(this.fields)) {
			if (messages.length > 0) result[field] = messages[0];
		}
		return result;
	}

	static is(e: unknown): e is ApiError {
		return e instanceof ApiError;
	}
}

/** Back-compat helper for code paths that expect a plain object. */
export const parseApiError = (
	error: unknown,
): { message: string; status?: number; errors?: Record<string, string[]> } => {
	if (ApiError.is(error)) {
		return { message: error.message, status: error.status, errors: error.fields };
	}
	if (error instanceof Error) return { message: error.message };
	if (typeof error === 'object' && error !== null) {
		const err = error as Record<string, unknown>;
		return {
			message: (err.message as string) || 'An unexpected error occurred.',
			status: err.status as number | undefined,
			errors: err.errors as Record<string, string[]> | undefined,
		};
	}
	return { message: 'An unexpected error occurred.' };
};
