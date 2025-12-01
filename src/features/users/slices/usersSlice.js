import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchClient } from "../../../services/fetchClient.js";
import { endpoints } from "../../../config/apiConfig.js";

const initialState = {
  users: [],
  currentUser: null,
  status: "idle",
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pageSize: 10,
  },
  mutationStatus: {
    create: "idle",
    update: "idle",
    delete: "idle",
  },
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchClient.get(endpoints.users.list, {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchClient.get(endpoints.users.detail(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await fetchClient.post(endpoints.users.create, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fetchClient.put(endpoints.users.update(id), data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await fetchClient.delete(endpoints.users.delete(id));
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "success";
        const payload = action.payload || {};
        state.users = payload.users || [];
        state.pagination = {
          page: payload.page || 1,
          pageSize: payload.page_size || payload.pageSize || state.pagination.pageSize,
          limit: payload.page_size || payload.pageSize || state.pagination.pageSize,
          total: payload.total || 0,
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.mutationStatus.create = "loading";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.mutationStatus.create = "success";
        if (action.payload) {
          state.users = [action.payload, ...state.users];
          state.pagination.total += 1;
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.mutationStatus.create = "error";
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.mutationStatus.update = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.mutationStatus.update = "success";
        state.users = state.users.map((user) =>
          user.id === action.payload?.id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.mutationStatus.update = "error";
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.mutationStatus.delete = "loading";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.mutationStatus.delete = "success";
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.pagination.total = Math.max(state.pagination.total - 1, 0);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.mutationStatus.delete = "error";
        state.error = action.payload;
      });
  },
});

export const { setCurrentUser, clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;

