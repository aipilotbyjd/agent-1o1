import type { TListParams } from './api.type';

// Event `type` key on a notification, e.g. `execution.failed`. Kept as a
// loose string since the backend can introduce new event keys at any time.
export type TNotificationType = string;

export type TNotification = {
	id: string;
	workspace_id?: string;
	type: TNotificationType;
	title: string;
	body: string | null;
	data: Record<string, unknown>;
	read_at: string | null;
	is_read: boolean;
	created_at: string;
};

export type TNotificationFilters = TListParams & {
	/** When `true`, only unread notifications are returned. */
	unread?: boolean;
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
