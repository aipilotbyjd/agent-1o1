import { createContext, useContext, useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useWorkspaceContext } from '@/context/workspaceContext';
import { getAccessToken } from '@/api/core/token-manager';
import { useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '@/api/modules/notifications/notifications.keys';
import { notify } from '@/api/core';

// Ensure Pusher is on window for Laravel Echo
if (typeof window !== 'undefined') {
	(window as any).Pusher = Pusher;
}

interface IRealtimeContext {
	echo: Echo<any> | null;
}

const RealtimeContext = createContext<IRealtimeContext>({ echo: null });

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
	const { activeWorkspaceId } = useWorkspaceContext();
	const [echo, setEcho] = useState<Echo<any> | null>(null);
	const qc = useQueryClient();

	useEffect(() => {
		const token = getAccessToken();
		if (!token || !activeWorkspaceId) {
			if (echo) {
				echo.disconnect();
				setEcho(null);
			}
			return;
		}

		const apiBase = (import.meta.env.VITE_API_URL || 'https://agent1o1.test/api/v1').replace(
			'/api/v1',
			'',
		);

		const reverbAppKey = import.meta.env.VITE_REVERB_APP_KEY || 'agent1o1-key';
		const reverbHost = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
		const reverbPort = import.meta.env.VITE_REVERB_PORT
			? parseInt(import.meta.env.VITE_REVERB_PORT, 10)
			: 443;
		const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'https';

		const newEcho = new Echo({
			broadcaster: 'reverb',
			key: reverbAppKey,
			wsHost: reverbHost,
			wsPort: reverbPort,
			wssPort: reverbPort,
			forceTLS: reverbScheme === 'https',
			enabledTransports: ['ws', 'wss'],
			authEndpoint: `${apiBase}/broadcasting/auth`,
			auth: {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		});

		setEcho(newEcho);

		const channel = newEcho.private(`workspace.${activeWorkspaceId}`);

		channel.listen('notification.created', (notification: any) => {
			console.info('Real-time notification received:', notification);
			// Display a toast/notification
			notify.success(notification.title || 'New notification received');
			// Invalidate every notification query (lists across filters + unread count)
			qc.invalidateQueries({ queryKey: notificationKeys.all(activeWorkspaceId) });
		});

		return () => {
			newEcho.disconnect();
		};
	}, [activeWorkspaceId]);

	return <RealtimeContext.Provider value={{ echo }}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => useContext(RealtimeContext);
