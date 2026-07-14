import type { TListParams } from './api.type';

export type TNotificationType =
	| 'execution_failed'
	| 'execution_succeeded'
	| 'workflow_shared'
	| 'invitation_received'
	| 'credit_low'
	| 'system';

export type TNotification = {
	id: string;
	type: TNotificationType;
	title: string;
	message: string;
	data: Record<string, unknown>;
	read_at: string | null;
	created_at: string;
};

export type TNotificationFilters = TListParams & {
	read?: boolean;
	type?: TNotificationType;
};

export type TUnreadCount = { count: number };

// ── Delivery channels (used in preferences) ─────────────
export type TDeliveryChannel = 'database' | 'mail' | 'slack' | 'discord' | 'webhook' | 'sms';

export type TAvailableChannel = {
	id: TDeliveryChannel;
	label: string;
	requires_stored_config: boolean;
};

// ── Preferences ──────────────────────────────────────────
export type TNotificationPreference = {
	type: string;
	label: string;
	enabled: boolean;
	channels: TDeliveryChannel[];
};

export type TNotificationPreferencesResponse = {
	grouped: Record<string, TNotificationPreference[]>;
	available_channels: TAvailableChannel[];
	preferences: TNotificationPreference[];
};

export type TUpdateNotificationPreferencesDto = {
	preferences: Record<string, { enabled?: boolean; channels?: TDeliveryChannel[] }>;
};

// ── Channels ─────────────────────────────────────────────
export type TNotificationChannelType = 'slack' | 'discord' | 'webhook' | 'sms';

export type TNotificationChannel = {
	id: string;
	channel: TNotificationChannelType;
	label: string;
	config: Record<string, unknown>;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

export type TChannelConfig = { url: string; secret?: string } | { url: string } | { phone: string };

export type TCreateNotificationChannelDto = {
	channel: TNotificationChannelType;
	label: string;
	config: {
		url?: string;
		secret?: string;
		phone?: string;
	};
};

export type TUpdateNotificationChannelDto = {
	label?: string;
	config?: {
		url?: string;
		secret?: string;
		phone?: string;
	};
	is_active?: boolean;
};
