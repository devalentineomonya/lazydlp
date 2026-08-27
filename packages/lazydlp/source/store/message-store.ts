import {create} from 'zustand';
import {Message} from '../types/types.js';

interface MessageState {
	history: Message[];
	/**
	 * Bumped by clearMessages(). Used as the <Static> key so Ink remounts it
	 * and stops replaying already-printed messages after /clear.
	 */
	staticEpoch: number;
	addMessage: (type: Message['type'], text: string) => void;
	updateMessage: (id: string, text: string, isPending?: boolean) => void;
	addTemporaryMessage: (
		type: Message['type'],
		text: string,
		isPending?: boolean,
	) => string;
	clearMessages: () => void;
}

let nextId = 0;
const makeId = () => String(nextId++);

export const useMessageStore = create<MessageState>(set => ({
	history: [],
	staticEpoch: 0,
	addMessage: (type, text) =>
		set(state => ({
			history: [...state.history, {id: makeId(), type, text, revision: 0}],
		})),
	addTemporaryMessage: (type, text, isPending) => {
		const id = makeId();
		set(state => ({
			history: [...state.history, {id, type, text, isPending, revision: 0}],
		}));
		return id;
	},
	updateMessage: (id, text, isPending) =>
		set(state => ({
			history: state.history.map(msg => {
				if (msg.id !== id) return msg;

				// A message that has finished has already been committed to <Static>
				// and printed to the terminal, so it can never be repainted. Refuse to
				// send it back to pending: doing so would pull it out of the static
				// region and print a second copy of it in the live frame.
				if (msg.isPending === false) return msg;

				return {
					...msg,
					text,
					revision: (msg.revision ?? 0) + 1,
					isPending: isPending === undefined ? msg.isPending : isPending,
				};
			}),
		})),
	clearMessages: () =>
		set(state => ({history: [], staticEpoch: state.staticEpoch + 1})),
}));
