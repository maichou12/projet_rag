import { create } from 'zustand';
import {
  sendChatMessage,
  fetchConversations,
  createConversation,
  fetchConversation,
  updateConversation,
  deleteConversation,
  fetchSuggestions,
} from '../api/client';

export const WELCOME_MESSAGE = {
  role: 'bot',
  content:
    "Bonjour. Je suis votre assistant juridique, spécialisé dans le Code de la Famille de la République du Sénégal. Je suis à votre écoute pour toute question relative au mariage, à la filiation, aux successions ou à l'autorité parentale.",
  quote:
    '« La justice est la première vertu des institutions sociales. » — Proverbe wolof',
  timestamp: new Date().toISOString(),
  isWelcome: true,
};

function getLastSources(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'bot' && messages[i].sources?.length) {
      return messages[i].sources;
    }
  }
  return [];
}

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeId: null,
  messages: [WELCOME_MESSAGE],
  sources: [],
  suggestions: [],
  input: '',
  loading: false,
  loadingList: true,
  sidebarOpen: false,

  setInput: (input) => set({ input }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  init: async () => {
    set({ loadingList: true });
    try {
      const [list, suggestions] = await Promise.all([
        fetchConversations(),
        fetchSuggestions(),
      ]);
      set({ suggestions });
      if (list.length > 0) {
        set({ conversations: list });
        await get().selectConversation(list[0].id);
      } else {
        await get().startNewConversation();
      }
    } catch {
      set({ conversations: [], suggestions: [] });
    } finally {
      set({ loadingList: false });
    }
  },

  selectConversation: async (id) => {
    try {
      const conv = await fetchConversation(id);
      const loaded =
        conv.messages.length > 0 ? conv.messages : [WELCOME_MESSAGE];
      set({
        activeId: id,
        messages: loaded,
        sources: getLastSources(loaded),
        input: '',
      });
      return conv;
    } catch {
      set({ messages: [WELCOME_MESSAGE], sources: [] });
      return null;
    }
  },

  startNewConversation: async () => {
    const conv = await createConversation();
    set((state) => ({
      conversations: [
        { id: conv.id, title: conv.title, updated_at: conv.updated_at },
        ...state.conversations,
      ],
      activeId: conv.id,
      messages: [WELCOME_MESSAGE],
      sources: [],
      input: '',
    }));
    return conv.id;
  },

  removeConversation: async (id) => {
    await deleteConversation(id);
    const { conversations, activeId } = get();
    const remaining = conversations.filter((c) => c.id !== id);
    set({ conversations: remaining });
    if (activeId === id) {
      if (remaining.length > 0) {
        await get().selectConversation(remaining[0].id);
      } else {
        await get().startNewConversation();
      }
    }
  },

  saveMessages: async (msgs) => {
    const { activeId } = get();
    if (!activeId) return;
    const toSave = msgs.filter((m) => !m.isWelcome);
    const updated = await updateConversation(activeId, toSave);
    set((state) => ({
      conversations: state.conversations
        .map((c) =>
          c.id === activeId
            ? { ...c, title: updated.title, updated_at: updated.updated_at }
            : c
        )
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    }));
  },

  sendMessage: async (question) => {
    const q = (question ?? get().input).trim();
    if (!q || get().loading) return;

    const now = new Date().toISOString();
    const userMsg = { role: 'user', content: q, timestamp: now };
    const baseMessages = get().messages.filter((m) => !m.isWelcome);
    const nextMessages = [...baseMessages, userMsg];

    set({ messages: nextMessages, input: '', loading: true });

    try {
      const data = await sendChatMessage(q);
      const botMsg = {
        role: 'bot',
        content: data.reponse,
        sources: data.sources,
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...nextMessages, botMsg];
      set({ messages: finalMessages, sources: data.sources });
      await get().saveMessages(finalMessages);
    } catch (err) {
      const errorMsg = {
        role: 'bot',
        content: `Erreur : ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...nextMessages, errorMsg];
      set({ messages: finalMessages, sources: [] });
      await get().saveMessages(finalMessages);
    } finally {
      set({ loading: false });
    }
  },

  prefillQuestion: (question) => set({ input: question }),
}));
