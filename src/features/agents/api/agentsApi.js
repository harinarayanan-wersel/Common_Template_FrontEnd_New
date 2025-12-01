import { fetchClient } from "../../../services/fetchClient.js";
import { endpoints } from "../../../config/apiConfig.js";

export const agentsApi = {
  getAgents: async (params) => {
    const response = await fetchClient.get(endpoints.agents.list, { params });
    return response.data;
  },

  getAgent: async (id) => {
    const response = await fetchClient.get(endpoints.agents.detail(id));
    return response.data;
  },

  createAgent: async (data) => {
    const response = await fetchClient.post(endpoints.agents.create, data);
    return response.data;
  },

  updateAgent: async (id, data) => {
    const response = await fetchClient.put(endpoints.agents.update(id), data);
    return response.data;
  },

  deleteAgent: async (id) => {
    const response = await fetchClient.delete(endpoints.agents.delete(id));
    return response.data;
  },
};

