import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { rolesApi } from "@/features/roles/api/rolesApi.js";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  pagination: {
    page: 1,
    page_size: 20,
    total: 0,
  },
  permissions: [],
  permissionsStatus: "idle",
  permissionsError: null,
  mutationStatus: {
    create: "idle",
    update: "idle",
    delete: "idle",
  },
};

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await rolesApi.list(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await rolesApi.create(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateRoleRequest = createAsyncThunk(
  "roles/updateRole",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await rolesApi.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      await rolesApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchPermissions = createAsyncThunk(
  "roles/fetchPermissions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await rolesApi.listPermissions(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = "success";
        state.list = action.payload?.roles ?? [];
        state.pagination = {
          page: action.payload?.page ?? 1,
          page_size: action.payload?.page_size ?? state.pagination.page_size,
          total: action.payload?.total ?? 0,
        };
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })
      .addCase(createRole.pending, (state) => {
        state.mutationStatus.create = "loading";
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.mutationStatus.create = "success";
        if (action.payload) {
          state.list = [action.payload, ...state.list];
          state.pagination.total += 1;
        }
      })
      .addCase(createRole.rejected, (state, action) => {
        state.mutationStatus.create = "error";
        state.error = action.payload;
      })
      .addCase(updateRoleRequest.pending, (state) => {
        state.mutationStatus.update = "loading";
        state.error = null;
      })
      .addCase(updateRoleRequest.fulfilled, (state, action) => {
        state.mutationStatus.update = "success";
        state.list = state.list.map((role) =>
          role.id === action.payload?.id ? action.payload : role
        );
      })
      .addCase(updateRoleRequest.rejected, (state, action) => {
        state.mutationStatus.update = "error";
        state.error = action.payload;
      })
      .addCase(deleteRole.pending, (state) => {
        state.mutationStatus.delete = "loading";
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.mutationStatus.delete = "success";
        state.list = state.list.filter((role) => role.id !== action.payload);
        state.pagination.total = Math.max(state.pagination.total - 1, 0);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.mutationStatus.delete = "error";
        state.error = action.payload;
      })
      .addCase(fetchPermissions.pending, (state) => {
        state.permissionsStatus = "loading";
        state.permissionsError = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissionsStatus = "success";
        state.permissions = action.payload?.permissions ?? [];
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.permissionsStatus = "error";
        state.permissionsError = action.payload;
      });
  },
});

export const selectRoles = (state) => state.roles.list;
export const selectRolesStatus = (state) => state.roles.status;
export const selectPermissions = (state) => state.roles.permissions;
export const selectPermissionsStatus = (state) => state.roles.permissionsStatus;

export const selectPermissionMetadata = createSelector(
  selectPermissions,
  (permissions) => {
    const modules = [];
    const moduleSet = new Set();
    const actionsSet = new Set();
    const matrix = new Map();

    permissions.forEach((permission) => {
      const moduleKey = permission.module || "general";
      const actionKey = permission.action || "access";

      if (!moduleSet.has(moduleKey)) {
        moduleSet.add(moduleKey);
        modules.push(moduleKey);
      }
      actionsSet.add(actionKey);

      if (!matrix.has(moduleKey)) {
        matrix.set(moduleKey, {});
      }
      matrix.get(moduleKey)[actionKey] = permission;
    });

    return {
      modules: modules.sort((a, b) => a.localeCompare(b)),
      actions: Array.from(actionsSet).sort((a, b) => a.localeCompare(b)),
      matrix,
    };
  }
);

export default rolesSlice.reducer;


