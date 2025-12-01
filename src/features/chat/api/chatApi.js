import { fetchClient } from "../../../services/fetchClient.js";
import { endpoints } from "../../../config/apiConfig.js";

export const chatApi = {
  getChats: async (params) => {
    const response = await fetchClient.get(endpoints.chat.list, { params });
    return response.data;
  },

  getChat: async (id) => {
    const response = await fetchClient.get(endpoints.chat.detail(id));
    return response.data;
  },

  createChat: async (data) => {
    const response = await fetchClient.post(endpoints.chat.create, data);
    return response.data;
  },

  updateChat: async (id, data) => {
    const response = await fetchClient.put(endpoints.chat.update(id), data);
    return response.data;
  },

  deleteChat: async (id) => {
    const response = await fetchClient.delete(endpoints.chat.delete(id));
    return response.data;
  },

  getMessages: async (chatId) => {
    const response = await fetchClient.get(endpoints.chat.messages(chatId));
    return response.data;
  },

  sendMessage: async (prompt) => {
    // Placeholder for future backend integration. Mimic latency for UX parity.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
      message:
        "Here's a quick draft response. Plug into the workflow when you're ready to take action.",
      echo: prompt,
    };
  },
};

