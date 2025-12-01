import { fetchClient } from "@/services/fetchClient.js";
import { endpoints } from "@/config/apiConfig.js";

export const teamUnitsApi = {
  async fetchTree(params = {}) {
    const response = await fetchClient.get(endpoints.teamUnits.tree, { params });
    return response.data;
  },

  async fetchDetail(id, params = {}) {
    if (!id) throw new Error("team unit id is required");
    const response = await fetchClient.get(endpoints.teamUnits.detail(id), {
      params,
    });
    return response.data;
  },

  async create(payload) {
    const response = await fetchClient.post(endpoints.teamUnits.create, payload);
    return response.data;
  },

  async update(id, payload) {
    if (!id) throw new Error("team unit id is required");
    const response = await fetchClient.put(endpoints.teamUnits.update(id), payload);
    return response.data;
  },

  async remove(id) {
    if (!id) throw new Error("team unit id is required");
    const response = await fetchClient.delete(endpoints.teamUnits.delete(id));
    return response.data;
  },

  async assignMembers(unitId, userIds) {
    if (!unitId) throw new Error("team unit id is required");
    const response = await fetchClient.post(endpoints.teamUnits.assignMembers(unitId), {
      user_ids: userIds,
    });
    return response.data;
  },

  async removeMember(userId) {
    if (!userId) throw new Error("user id is required");
    const response = await fetchClient.delete(endpoints.teamUnits.removeMember(userId));
    return response.data;
  },
};

export const assignableUsersApi = {
  async list(params = {}) {
    const response = await fetchClient.get(endpoints.users.assignable, {
      params,
    });
    return response.data;
  },
};
