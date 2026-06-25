export const notificationPreferenceKeys = {
	all: (ws?: string) => (ws ? ['notification-preferences', ws] as const : ['notification-preferences'] as const),
};

