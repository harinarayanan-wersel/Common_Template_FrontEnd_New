import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";
import { chatApi } from "../api/chatApi.js";

const STORAGE_KEY = "ai-chat-sessions";

const defaultConversationId = "session-1";
const defaultStatePayload = {
  conversations: [
    {
      id: defaultConversationId,
      title: "Product launch brainstorm",
      createdAt: "2023-11-05T10:00:00.000Z",
      updatedAt: "2023-11-05T10:05:00.000Z",
      preview: "Let's map the onboarding prompts first.",
      isFavorite: false,
    },
  ],
  messagesByChat: {
    [defaultConversationId]: [
      {
        id: "msg-1",
        sender: "ai",
        content: "Let's map the onboarding prompts first.",
        timestamp: "2023-11-05T10:00:00.000Z",
      },
      {
        id: "msg-2",
        sender: "user",
        content: "Great, can you highlight the risky areas?",
        timestamp: "2023-11-05T10:02:00.000Z",
      },
      {
        id: "msg-3",
        sender: "ai",
        content: "Watch adoption, SLA adherence, and blocked stories this week.",
        timestamp: "2023-11-05T10:05:00.000Z",
      },
    ],
  },
  activeChatId: null,
};

const loadPersistedState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const loadChatHistory = createAsyncThunk("chat/loadChatHistory", async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const persisted = loadPersistedState();
  if (persisted) {
    return persisted;
  }
  return defaultStatePayload;
});

export const sendPrompt = createAsyncThunk(
  "chat/sendPrompt",
  async ({ chatId, prompt }, { rejectWithValue }) => {
    try {
      const response = await chatApi.sendMessage(prompt);
      return {
        chatId,
        content: response?.message || "Here's a quick follow-up you can build on.",
      };
    } catch (error) {
      return rejectWithValue(error?.message || "Unable to fetch AI response.");
    }
  }
);

const initialState = {
  conversations: [],
  messagesByChat: {},
  activeChatId: null,
  status: "idle",
  error: null,
  typingStatus: {},
};

const updateConversationMeta = (state, chatId, content) => {
  const conversation = state.conversations.find((chat) => chat.id === chatId);
  if (conversation) {
    conversation.preview = content;
    conversation.updatedAt = new Date().toISOString();
  }
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },
    createConversation: {
      reducer: (state, action) => {
        const conversation = action.payload;
        state.conversations.unshift(conversation);
        state.activeChatId = conversation.id;
        state.messagesByChat[conversation.id] = [];
      },
      prepare: (title = "New conversation") => ({
        payload: {
          id: nanoid(),
          title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          preview: "",
          isFavorite: false,
        },
      }),
    },
    sendMessage: (state, action) => {
      const { chatId, content, attachments } = action.payload;
      if (!chatId || (!content?.trim() && (!attachments || attachments.length === 0))) return;
      const message = {
        id: nanoid(),
        sender: "user",
        content: content?.trim() || "",
        attachments: attachments || [],
        timestamp: new Date().toISOString(),
      };
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      state.messagesByChat[chatId].push(message);
      updateConversationMeta(state, chatId, message.content || "Sent an attachment");
    },
    renameConversation: (state, action) => {
      const { id, title } = action.payload;
      const conversation = state.conversations.find((chat) => chat.id === id);
      if (conversation && title?.trim()) {
        conversation.title = title.trim();
        conversation.updatedAt = new Date().toISOString();
      }
    },
    toggleFavorite: (state, action) => {
      const conversation = state.conversations.find((chat) => chat.id === action.payload);
      if (conversation) {
        conversation.isFavorite = !conversation.isFavorite;
      }
    },
    deleteConversation: (state, action) => {
      const id = action.payload;
      state.conversations = state.conversations.filter((chat) => chat.id !== id);
      delete state.messagesByChat[id];
      if (state.activeChatId === id) {
        state.activeChatId = state.conversations[0]?.id || null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadChatHistory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadChatHistory.fulfilled, (state, action) => {
        state.status = "success";
        state.conversations = action.payload.conversations || [];
        state.messagesByChat = action.payload.messagesByChat || {};
        state.activeChatId = action.payload.activeChatId || null;
      })
      .addCase(loadChatHistory.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      })
      .addCase(sendPrompt.pending, (state, action) => {
        const chatId = action.meta.arg.chatId;
        state.typingStatus[chatId] = true;
      })
      .addCase(sendPrompt.fulfilled, (state, action) => {
        const { chatId, content } = action.payload;
        if (!chatId) return;
        const message = {
          id: nanoid(),
          sender: "ai",
          content,
          timestamp: new Date().toISOString(),
        };
        if (!state.messagesByChat[chatId]) {
          state.messagesByChat[chatId] = [];
        }
        state.messagesByChat[chatId].push(message);
        updateConversationMeta(state, chatId, message.content);
        state.typingStatus[chatId] = false;
      })
      .addCase(sendPrompt.rejected, (state, action) => {
        const chatId = action.meta.arg.chatId;
        state.typingStatus[chatId] = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  setActiveChat,
  createConversation,
  sendMessage,
  renameConversation,
  toggleFavorite,
  deleteConversation,
} = chatSlice.actions;
export default chatSlice.reducer;
export const CHAT_STORAGE_KEY = STORAGE_KEY;

