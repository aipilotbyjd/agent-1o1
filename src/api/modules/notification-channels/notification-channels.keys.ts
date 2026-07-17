export const notificationChannelKeys = {
	all: (ws?: string) => (ws ? ['notification-channels', ws] as const : ['notification-channels'] as const),
	list: (ws: string) => ['notification-channels', ws, 'list'] as const,
};

