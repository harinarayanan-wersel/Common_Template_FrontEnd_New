import { fetchClient } from "../../../services/fetchClient.js";
import { endpoints } from "../../../config/apiConfig.js";

export const usersApi = {
  getUsers: async (params) => {
    const response = await fetchClient.get(endpoints.users.list, { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await fetchClient.get(endpoints.users.detail(id));
    return response.data;
  },

  createUser: async (data) => {
    const response = await fetchClient.post(endpoints.users.create, data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await fetchClient.put(endpoints.users.update(id), data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await fetchClient.delete(endpoints.users.delete(id));
    return response.data;
  },
};

