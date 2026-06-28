import { create } from 'zustand';
import { Message } from '../types/types.js';

interface MessageState {
    history: Message[];
    addMessage: (type: Message['type'], text: string) => void;
    updateMessage: (id: string, text: string) => void;
    addTemporaryMessage: (type: Message['type'], text: string) => string;
    clearMessages: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    history: [],
    addMessage: (type, text) => set((state) => ({
        history: [...state.history, { id: Math.random().toString(), type, text }]
    })),
    addTemporaryMessage: (type, text) => {
        const id = Math.random().toString();
        set((state) => ({
            history: [...state.history, { id, type, text }]
        }));
        return id;
    },
    updateMessage: (id, text) => set((state) => ({
        history: state.history.map(msg => msg.id === id ? { ...msg, text } : msg)
    })),
    clearMessages: () => set({ history: [] })
}));
