import type { IBuilderMessageReadyEvent } from '@/types/workflowBuilder.type';

/**
 * Minimal structural type for a Laravel Echo instance. We avoid a hard
 * dependency on `laravel-echo` / `pusher-js` so this module compiles even when
 * realtime is wired up by the host application. Pass in whatever Echo instance
 * the app already constructs (see the WebSocket section of the builder docs).
 */
export interface IEchoChannelLike {
	listen: (event: string, cb: (payload: unknown) => void) => IEchoChannelLike;
	stopListening?: (event: string) => IEchoChannelLike;
}

export interface IEchoLike {
	private: (channel: string) => IEchoChannelLike;
	leave: (channel: string) => void;
}

export const builderChannelName = (sessionId: string) => `builder.session.${sessionId}`;

/** Event name as broadcast by Reverb (note the leading dot in Echo's `.listen`). */
export const BUILDER_MESSAGE_READY_EVENT = '.builder.message.ready';

export interface ISubscribeBuilderSessionOptions {
	onReady: (event: IBuilderMessageReadyEvent) => void;
	onError?: (event: IBuilderMessageReadyEvent) => void;
}

/**
 * Subscribe to a builder session's private channel. Returns an unsubscribe
 * function. The `onError` callback (if provided) fires for events where
 * `event.error === true`; otherwise everything routes through `onReady`.
 *
 * @example
 *   const unsub = subscribeToBuilderSession(echo, sessionId, {
 *     onReady: (e) => { setNodes(e.draft.nodes); setEdges(e.draft.edges); },
 *     onError: (e) => showError(e.message.error_message),
 *   });
 *   // later: unsub();
 */
export function subscribeToBuilderSession(
	echo: IEchoLike,
	sessionId: string,
	{ onReady, onError }: ISubscribeBuilderSessionOptions,
): () => void {
	const channel = builderChannelName(sessionId);

	echo.private(channel).listen(BUILDER_MESSAGE_READY_EVENT, (payload) => {
		const event = payload as IBuilderMessageReadyEvent;
		if (event.error && onError) {
			onError(event);
			return;
		}
		onReady(event);
	});

	return () => echo.leave(channel);
}
