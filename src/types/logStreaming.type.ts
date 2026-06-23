export type TLogStreamingProvider =
	| 'datadog'
	| 'splunk'
	| 'loggly'
	| 'papertrail'
	| 'cloudwatch'
	| 'http';

export type TLogStreamingConfig = {
	id: string;
	workspace_id: string;
	provider: TLogStreamingProvider;
	name: string;
	endpoint: string;
	credentials: Record<string, unknown>;
	filters: Record<string, unknown>;
	is_active: boolean;
	last_streamed_at: string | null;
	created_at: string;
	updated_at: string;
};

export type TCreateLogStreamingConfigDto = {
	provider: TLogStreamingProvider;
	name: string;
	endpoint: string;
	credentials: Record<string, unknown>;
	filters?: Record<string, unknown>;
	is_active?: boolean;
};

export type TUpdateLogStreamingConfigDto = Partial<TCreateLogStreamingConfigDto>;
