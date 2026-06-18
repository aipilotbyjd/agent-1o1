import { create } from 'zustand';

export type TAiChatMessage = {
	id: string;
	role: 'assistant' | 'user';
	text: string;
	timestamp?: string;
	avatarUrl?: string;
	isThought?: boolean;
};

type TAiChatState = {
	isChatActive: boolean;
	isThinking: boolean;
	messages: TAiChatMessage[];
	startChat: (initialPrompt: string) => void;
	sendMessage: (prompt: string) => void;
	setThinking: (thinking: boolean) => void;
	resetChat: () => void;
	exitChat: () => void;
};

const makeId = () => `ai_msg_${Math.random().toString(36).slice(2, 9)}`;

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

export const useAiChatStore = create<TAiChatState>((set, get) => ({
	isChatActive: false,
	isThinking: false,
	messages: [WELCOME_MESSAGE],

	startChat: (initialPrompt) => {
		const timeStr = getCurrentTimeStr();
		const userMsg: TAiChatMessage = {
			id: makeId(),
			role: 'user',
			text: initialPrompt,
			timestamp: timeStr,
		};

		set({
			isChatActive: true,
			isThinking: true,
			messages: [WELCOME_MESSAGE, userMsg],
		});

		// Trigger mock assistant response after a short thinking delay
		setTimeout(() => {
			const replyMsg: TAiChatMessage = {
				id: makeId(),
				role: 'assistant',
				text: GUMMIE_RESPONSE,
				timestamp: getCurrentTimeStr(),
				isThought: true, // will display the "Thought for a couple of seconds"
			};
			set({
				isThinking: false,
				messages: [...get().messages, replyMsg],
			});
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

		set({
			isThinking: true,
			messages: [...get().messages, userMsg],
		});

		// Respond to follow-up messages
		setTimeout(() => {
			let responseText = '';
			if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
				responseText = "Hi! I am here to help you design, configure, and customize your workflow. What specific integration or logic would you like to add next?";
			} else {
				responseText = `I've analyzed your request: "${prompt}". I recommend adding an action step to connect your services. Would you like me to build it on the canvas?`;
			}

			const replyMsg: TAiChatMessage = {
				id: makeId(),
				role: 'assistant',
				text: responseText,
				timestamp: getCurrentTimeStr(),
			};

			set({
				isThinking: false,
				messages: [...get().messages, replyMsg],
			});
		}, 1500);
	},

	setThinking: (thinking) => set({ isThinking: thinking }),

	resetChat: () => {
		set({
			isThinking: false,
			messages: [
				{
					...WELCOME_MESSAGE,
					timestamp: getCurrentTimeStr(),
				},
			],
		});
	},

	exitChat: () => {
		set({
			isChatActive: false,
			isThinking: false,
			messages: [WELCOME_MESSAGE],
		});
	},
}));
