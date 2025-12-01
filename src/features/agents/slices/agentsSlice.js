import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchClient } from "../../../services/fetchClient.js";
import { endpoints } from "../../../config/apiConfig.js";

const initialState = {
  agents: [],
  currentAgent: null,
  status: "idle",
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const fetchAgents = createAsyncThunk(
  "agents/fetchAgents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchClient.get(endpoints.agents.list, {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchAgent = createAsyncThunk(
  "agents/fetchAgent",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchClient.get(endpoints.agents.detail(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

const agentsSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {
    setCurrentAgent: (state, action) => {
      state.currentAgent = action.payload;
    },
    clearCurrentAgent: (state) => {
      state.currentAgent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.status = "success";
        state.agents = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })
      .addCase(fetchAgent.fulfilled, (state, action) => {
        state.currentAgent = action.payload;
      });
  },
});

export const { setCurrentAgent, clearCurrentAgent } = agentsSlice.actions;
export default agentsSlice.reducer;

