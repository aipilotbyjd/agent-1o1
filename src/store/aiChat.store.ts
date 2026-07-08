import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TAiChatMessage = {
	id: string;
	role: 'assistant' | 'user';
	text: string;
	timestamp?: string;
	avatarUrl?: string;
	isThought?: boolean;
};

export type TAiChatSession = {
	id: string;
	title: string;
	messages: TAiChatMessage[];
	createdAt: number;
	updatedAt: number;
};

type TAiChatState = {
	isChatActive: boolean;
	isThinking: boolean;
	messages: TAiChatMessage[];
	workflowBuildStep: number; // 0 = none, 1 = first card, 2 = second card, 3 = third card
	sessions: TAiChatSession[];
	activeSessionId: string;
	startChat: (initialPrompt: string) => void;
	sendMessage: (prompt: string) => void;
	setThinking: (thinking: boolean) => void;
	resetChat: () => void;
	exitChat: () => void;
	newChat: () => void;
	loadSession: (id: string) => void;
	deleteSession: (id: string) => void;
};

const makeId = () => `ai_msg_${Math.random().toString(36).slice(2, 9)}`;
const makeSessionId = () => `ai_session_${Math.random().toString(36).slice(2, 9)}`;

const getCurrentTimeStr = () => {
	const now = new Date();
	let hours = now.getHours();
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	return `${hours}:${minutes} ${ampm}`;
};

const WELCOME_MESSAGE: TAiChatMessage = {
	id: 'welcome',
	role: 'assistant',
	text: "Hey! I'm your Workflow Builder. How can I help? Tell me about your idea, and I'll help you build it.",
	timestamp: getCurrentTimeStr(),
};

const GUMMIE_RESPONSE = `Hey there! 👋 Welcome to agent101!
I'm your AI flow-building assistant.
I'm here to help you create powerful automations — no coding required! 🚀

What would you like to automate today?
Feel free to describe your idea and I'll get to work building it for you!`;

const makeTitle = (prompt: string) => {
	const clean = prompt.trim().replace(/\s+/g, ' ');
	return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean || 'New chat';
};

const INITIAL_SESSION_ID = makeSessionId();

/** Persists the current session's messages/title/updatedAt back into the sessions list. */
const syncActiveSessionIntoList = (
	sessions: TAiChatSession[],
	activeSessionId: string,
	messages: TAiChatMessage[],
): TAiChatSession[] => {
	const idx = sessions.findIndex((s) => s.id === activeSessionId);
	const firstUserMsg = messages.find((m) => m.role === 'user');
	const title = firstUserMsg ? makeTitle(firstUserMsg.text) : 'New chat';

	if (idx === -1) {
		return [
			{ id: activeSessionId, title, messages, createdAt: Date.now(), updatedAt: Date.now() },
			...sessions,
		];
	}

	const updated = [...sessions];
	updated[idx] = { ...updated[idx], title, messages, updatedAt: Date.now() };
	return updated;
};

export const useAiChatStore = create<TAiChatState>()(
	persist(
		(set, get) => ({
			isChatActive: false,
			isThinking: false,
			messages: [WELCOME_MESSAGE],
			workflowBuildStep: 0,
			sessions: [],
			activeSessionId: INITIAL_SESSION_ID,

			startChat: (initialPrompt) => {
				const timeStr = getCurrentTimeStr();
				const userMsg: TAiChatMessage = {
					id: makeId(),
					role: 'user',
					text: initialPrompt,
					timestamp: timeStr,
				};

				const messages = [WELCOME_MESSAGE, userMsg];
				set((state) => ({
					isChatActive: true,
					isThinking: true,
					messages,
					workflowBuildStep: 0,
					sessions: syncActiveSessionIntoList(state.sessions, state.activeSessionId, messages),
				}));

				// Trigger mock assistant response after a short thinking delay
				setTimeout(() => {
					const replyId = makeId();
					const replyMsg: TAiChatMessage = {
						id: replyId,
						role: 'assistant',
						text: '',
						timestamp: getCurrentTimeStr(),
						isThought: true, // will display the "Thought for a couple of seconds"
					};
					const nextMessages = [...get().messages, replyMsg];
					set((state) => ({
						isThinking: false,
						messages: nextMessages,
						sessions: syncActiveSessionIntoList(
							state.sessions,
							state.activeSessionId,
							nextMessages,
						),
					}));

					// Stream GUMMIE_RESPONSE
					let currentLen = 0;
					const fullText = GUMMIE_RESPONSE;
					const interval = setInterval(() => {
						currentLen += Math.min(
							3 + Math.floor(Math.random() * 3),
							fullText.length - currentLen,
						);
						const streamedText = fullText.slice(0, currentLen);

						// Determine build step based on progress
						const progress = currentLen / fullText.length;
						let buildStep = 0;
						if (progress >= 0.85) {
							buildStep = 3;
						} else if (progress >= 0.5) {
							buildStep = 2;
						} else if (progress >= 0.15) {
							buildStep = 1;
						}

						set((state) => {
							const updatedMessages = state.messages.map((m) =>
								m.id === replyId ? { ...m, text: streamedText } : m,
							);
							return {
								messages: updatedMessages,
								workflowBuildStep: buildStep,
								sessions: syncActiveSessionIntoList(
									state.sessions,
									state.activeSessionId,
									updatedMessages,
								),
							};
						});

						if (currentLen >= fullText.length) {
							clearInterval(interval);
						}
					}, 30);
				}, 1800);
			},

			sendMessage: (prompt) => {
				const timeStr = getCurrentTimeStr();
				const userMsg: TAiChatMessage = {
					id: makeId(),
					role: 'user',
					text: prompt,
					timestamp: timeStr,
				};

				const messages = [...get().messages, userMsg];
				set((state) => ({
					isThinking: true,
					messages,
					sessions: syncActiveSessionIntoList(state.sessions, state.activeSessionId, messages),
				}));

				// Respond to follow-up messages
				setTimeout(() => {
					let responseText = '';
					if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
						responseText =
							'Hi! I am here to help you design, configure, and customize your workflow. What specific integration or logic would you like to add next?';
					} else {
						responseText = `I've analyzed your request: "${prompt}". I recommend adding an action step to connect your services. Would you like me to build it on the canvas?`;
					}

					const replyId = makeId();
					const replyMsg: TAiChatMessage = {
						id: replyId,
						role: 'assistant',
						text: '',
						timestamp: getCurrentTimeStr(),
					};

					const nextMessages = [...get().messages, replyMsg];
					set((state) => ({
						isThinking: false,
						messages: nextMessages,
						sessions: syncActiveSessionIntoList(
							state.sessions,
							state.activeSessionId,
							nextMessages,
						),
					}));

					// Stream responseText
					let currentLen = 0;
					const interval = setInterval(() => {
						currentLen += Math.min(
							3 + Math.floor(Math.random() * 3),
							responseText.length - currentLen,
						);
						const streamedText = responseText.slice(0, currentLen);

						set((state) => {
							const updatedMessages = state.messages.map((m) =>
								m.id === replyId ? { ...m, text: streamedText } : m,
							);
							return {
								messages: updatedMessages,
								sessions: syncActiveSessionIntoList(
									state.sessions,
									state.activeSessionId,
									updatedMessages,
								),
							};
						});

						if (currentLen >= responseText.length) {
							clearInterval(interval);
						}
					}, 30);
				}, 1500);
			},

			setThinking: (thinking) => set({ isThinking: thinking }),

			resetChat: () => {
				const messages = [{ ...WELCOME_MESSAGE, timestamp: getCurrentTimeStr() }];
				set((state) => ({
					isThinking: false,
					workflowBuildStep: 0,
					messages,
					sessions: syncActiveSessionIntoList(state.sessions, state.activeSessionId, messages),
				}));
			},

			exitChat: () => {
				set({
					isChatActive: false,
					isThinking: false,
					workflowBuildStep: 0,
					messages: [WELCOME_MESSAGE],
				});
			},

			/** Archives the current session (if it has any content) and starts a fresh one. */
			newChat: () => {
				const newId = makeSessionId();
				set({
					isChatActive: false,
					isThinking: false,
					workflowBuildStep: 0,
					messages: [WELCOME_MESSAGE],
					activeSessionId: newId,
				});
			},

			loadSession: (id) => {
				const session = get().sessions.find((s) => s.id === id);
				if (!session) return;
				set({
					activeSessionId: id,
					messages: session.messages,
					isChatActive: session.messages.some((m) => m.role === 'user'),
					isThinking: false,
					workflowBuildStep: 0,
				});
			},

			deleteSession: (id) => {
				set((state) => {
					const sessions = state.sessions.filter((s) => s.id !== id);
					if (state.activeSessionId !== id) return { sessions };

					const newId = makeSessionId();
					return {
						sessions,
						activeSessionId: newId,
						messages: [WELCOME_MESSAGE],
						isChatActive: false,
						isThinking: false,
						workflowBuildStep: 0,
					};
				});
			},
		}),
		{
			name: 'agent101-ai-chat-history',
			partialize: (state) => ({
				sessions: state.sessions,
				activeSessionId: state.activeSessionId,
				messages: state.messages,
				isChatActive: state.isChatActive,
			}),
		},
	),
);
