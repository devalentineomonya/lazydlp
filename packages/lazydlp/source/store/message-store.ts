import {create} from 'zustand';
import {Message} from '../types/types.js';

interface MessageState {
	history: Message[];
	addMessage: (type: Message['type'], text: string) => void;
	updateMessage: (id: string, text: string, isPending?: boolean) => void;
	addTemporaryMessage: (
		type: Message['type'],
		text: string,
		isPending?: boolean,
	) => string;
	clearMessages: () => void;
}

export const useMessageStore = create<MessageState>(set => ({
	history: [],
	addMessage: (type, text) =>
		set(state => ({
			history: [...state.history, {id: Math.random().toString(), type, text}],
		})),
	addTemporaryMessage: (type, text, isPending) => {
		const id = Math.random().toString();
		set(state => ({
			history: [...state.history, {id, type, text, isPending}],
		}));
		return id;
	},
	updateMessage: (id, text, isPending) =>
		set(state => ({
			history: state.history.map(msg =>
				msg.id === id
					? {
							...msg,
							text,
							isPending: isPending !== undefined ? isPending : msg.isPending,
					  }
					: msg,
			),
		})),
	clearMessages: () => set({history: []}),
}));
