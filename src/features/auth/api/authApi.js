import { fetchClient } from "../../../services/fetchClient.js";
import { endpoints } from "../../../config/apiConfig.js";

export const authApi = {
  login: async () => {
    return Promise.resolve({
      access_token: "mock-token",
      user: {
        id: 1,
        name: "Demo User",
        email: "demo@example.com",
      },
    });
  },

  register: async (userData) => {
    const response = await fetchClient.post(endpoints.auth.register, userData);
    return response.data;
  },

  logout: async () => {
    const response = await fetchClient.post(endpoints.auth.logout);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await fetchClient.get(endpoints.auth.me);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await fetchClient.post(endpoints.auth.refresh, {
      refreshToken,
    });
    return response.data;
  },
};

