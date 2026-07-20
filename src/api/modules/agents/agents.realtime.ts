import type {
	TAgentMessageReadyEvent,
	TAgentStreamTextDelta,
	TAgentStreamToolCall,
	TAgentStreamToolResult,
	TAgentStreamArtifact,
} from '@/types/agent.type';
import type { IEchoLike } from '@/api/modules/workflow-builder/workflow-builder.realtime';

export const agentStreamChannelName = (requestId: string) => `agent.stream.${requestId}`;

/** Event name as broadcast by AgentMessageReady (note the leading dot in Echo's `.listen`). */
export const AGENT_MESSAGE_READY_EVENT = '.agent.message.ready';

// Laravel\Ai's StreamEvent::broadcast() sends the bare event name from type()
// (e.g. "text_delta") — same leading-dot rule applies so Echo doesn't prefix
// it with the App.Events namespace.
export const AGENT_TEXT_DELTA_EVENT = '.text_delta';
export const AGENT_TOOL_CALL_EVENT = '.tool_call';
export const AGENT_TOOL_RESULT_EVENT = '.tool_result';
export const AGENT_ARTIFACT_EVENT = '.artifact';

export interface ISubscribeAgentStreamOptions {
	onReady: (event: TAgentMessageReadyEvent) => void;
	onTextDelta?: (event: TAgentStreamTextDelta) => void;
	onToolCall?: (event: TAgentStreamToolCall) => void;
	onToolResult?: (event: TAgentStreamToolResult) => void;
	onArtifact?: (event: TAgentStreamArtifact) => void;
}

/**
 * Subscribe to one agent-chat turn's private stream channel. Returns an
 * unsubscribe function. Mirrors subscribeToBuilderSession, adapted to
 * standalone Agent conversations — see ProcessAgentMessageJob on the backend.
 */
export function subscribeToAgentStream(
	echo: IEchoLike,
	requestId: string,
	{ onReady, onTextDelta, onToolCall, onToolResult, onArtifact }: ISubscribeAgentStreamOptions,
): () => void {
	const channelName = agentStreamChannelName(requestId);
	const instance = echo.private(channelName);

	instance.listen(AGENT_MESSAGE_READY_EVENT, (payload) => {
		onReady(payload as TAgentMessageReadyEvent);
	});

	if (onTextDelta) {
		instance.listen(AGENT_TEXT_DELTA_EVENT, (payload) => {
			onTextDelta(payload as TAgentStreamTextDelta);
		});
	}
	if (onToolCall) {
		instance.listen(AGENT_TOOL_CALL_EVENT, (payload) => {
			onToolCall(payload as TAgentStreamToolCall);
		});
	}
	if (onToolResult) {
		instance.listen(AGENT_TOOL_RESULT_EVENT, (payload) => {
			onToolResult(payload as TAgentStreamToolResult);
		});
	}
	if (onArtifact) {
		instance.listen(AGENT_ARTIFACT_EVENT, (payload) => {
			onArtifact(payload as TAgentStreamArtifact);
		});
	}

	return () => echo.leave(channelName);
}
