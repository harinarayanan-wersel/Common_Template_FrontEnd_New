import { fetchClient } from "@/services/fetchClient.js";
import { endpoints } from "@/config/apiConfig.js";

const defaultPagination = {
  page: 1,
  page_size: 50,
};

export const rolesApi = {
  async list(params = {}) {
    const response = await fetchClient.get(endpoints.roles.list, {
      params: { ...defaultPagination, ...params },
    });
    return response.data;
  },

  async get(id, params = {}) {
    if (!id) throw new Error("role id is required");
    const response = await fetchClient.get(endpoints.roles.detail(id), {
      params,
    });
    return response.data;
  },

  async create(payload) {
    const response = await fetchClient.post(endpoints.roles.create, payload);
    return response.data;
  },

  async update(id, payload) {
    if (!id) throw new Error("role id is required");
    const response = await fetchClient.put(endpoints.roles.update(id), payload);
    return response.data;
  },

  async remove(id) {
    if (!id) throw new Error("role id is required");
    const response = await fetchClient.delete(endpoints.roles.delete(id));
    return response.data;
  },

  async listPermissions(params = {}) {
    const response = await fetchClient.get(endpoints.roles.permissions, {
      params: {
        ...defaultPagination,
        page_size: 200,
        ...params,
      },
    });
    return response.data;
  },

  async updatePermissions(roleId, permissionIds) {
    if (!roleId) throw new Error("role id is required");
    const response = await fetchClient.put(
      endpoints.roles.updatePermissions(roleId),
      { permission_ids: permissionIds }
    );
    return response.data;
  },
};

export default rolesApi;

