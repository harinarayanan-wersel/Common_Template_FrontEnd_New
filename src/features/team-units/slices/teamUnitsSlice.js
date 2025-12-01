import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { assignableUsersApi, teamUnitsApi } from "../api/teamUnitsApi.js";

const formatMember = (member) => {
  if (!member) return null;
  const fullName =
    member.full_name ||
    member.name ||
    [member.first_name, member.last_name].filter(Boolean).join(" ").trim() ||
    member.email ||
    "Unknown";
  return {
    id: member.id,
    email: member.email,
    firstName: member.first_name,
    lastName: member.last_name,
    name: fullName,
    avatar: member.profile_url || member.avatar || null,
  };
};

const normalizeUnit = (unit) => ({
  id: unit.id,
  name: unit.name,
  description: unit.description || "",
  parentId: unit.parent_id ?? null,
  tenantId: unit.tenant_id,
  isActive: unit.is_active,
  userCount: unit.user_count ?? 0,
  members: Array.isArray(unit.members) ? unit.members.map(formatMember) : [],
});

const initialState = {
  list: [],
  status: "idle",
  error: null,
  membersByUnit: {},
  membersStatus: {},
  assignableUsers: [],
  assignableStatus: "idle",
  assignableError: null,
  mutationStatus: {
    create: "idle",
    update: "idle",
    delete: "idle",
    member: "idle",
  },
};

export const fetchTeamUnitsTree = createAsyncThunk(
  "teamUnits/fetchTree",
  async (_, { rejectWithValue }) => {
    try {
      const data = await teamUnitsApi.fetchTree();
      return data?.team_units ?? [];
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchTeamUnitMembers = createAsyncThunk(
  "teamUnits/fetchMembers",
  async (unitId, { rejectWithValue }) => {
    try {
      const data = await teamUnitsApi.fetchDetail(unitId, { include_members: true });
      return { unitId, data };
    } catch (error) {
      return rejectWithValue({ unitId, error: error.data || error.message });
    }
  }
);

export const createTeamUnit = createAsyncThunk(
  "teamUnits/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await teamUnitsApi.create(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateTeamUnit = createAsyncThunk(
  "teamUnits/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teamUnitsApi.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const deleteTeamUnit = createAsyncThunk(
  "teamUnits/delete",
  async (id, { rejectWithValue }) => {
    try {
      await teamUnitsApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const assignMembersToUnit = createAsyncThunk(
  "teamUnits/assignMembers",
  async ({ unitId, userIds }, { rejectWithValue }) => {
    try {
      const data = await teamUnitsApi.assignMembers(unitId, userIds);
      return { unitId, data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const removeMemberFromUnit = createAsyncThunk(
  "teamUnits/removeMember",
  async ({ unitId, userId }, { rejectWithValue }) => {
    try {
      await teamUnitsApi.removeMember(userId);
      return { unitId, userId };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchAssignableUsers = createAsyncThunk(
  "teamUnits/fetchAssignableUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await assignableUsersApi.list({ limit: 100, ...params });
      return data?.users ?? [];
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

const teamUnitsSlice = createSlice({
  name: "teamUnits",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamUnitsTree.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTeamUnitsTree.fulfilled, (state, action) => {
        state.status = "success";
        state.list = action.payload.map(normalizeUnit);
      })
      .addCase(fetchTeamUnitsTree.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })
      .addCase(fetchTeamUnitMembers.pending, (state, action) => {
        const unitId = action.meta.arg;
        if (unitId) {
          state.membersStatus[unitId] = "loading";
        }
      })
      .addCase(fetchTeamUnitMembers.fulfilled, (state, action) => {
        const { unitId, data } = action.payload || {};
        if (!unitId) return;
        state.membersStatus[unitId] = "success";
        state.membersByUnit[unitId] = (data?.members || data?.data?.members || data?.members_data || []).map(
          formatMember
        );

        state.list = state.list.map((unit) =>
          unit.id === unitId ? { ...unit, members: state.membersByUnit[unitId], userCount: state.membersByUnit[unitId].length } : unit
        );
      })
      .addCase(fetchTeamUnitMembers.rejected, (state, action) => {
        const unitId = action.payload?.unitId || action.meta.arg;
        if (unitId) {
          state.membersStatus[unitId] = "error";
        }
      })
      .addCase(createTeamUnit.pending, (state) => {
        state.mutationStatus.create = "loading";
        state.error = null;
      })
      .addCase(createTeamUnit.fulfilled, (state, action) => {
        state.mutationStatus.create = "success";
        if (action.payload) {
          state.list = [normalizeUnit(action.payload), ...state.list];
        }
      })
      .addCase(createTeamUnit.rejected, (state, action) => {
        state.mutationStatus.create = "error";
        state.error = action.payload;
      })
      .addCase(updateTeamUnit.pending, (state) => {
        state.mutationStatus.update = "loading";
      })
      .addCase(updateTeamUnit.fulfilled, (state, action) => {
        state.mutationStatus.update = "success";
        state.list = state.list.map((unit) =>
          unit.id === action.payload?.id ? normalizeUnit(action.payload) : unit
        );
      })
      .addCase(updateTeamUnit.rejected, (state, action) => {
        state.mutationStatus.update = "error";
        state.error = action.payload;
      })
      .addCase(deleteTeamUnit.pending, (state) => {
        state.mutationStatus.delete = "loading";
      })
      .addCase(deleteTeamUnit.fulfilled, (state, action) => {
        state.mutationStatus.delete = "success";
        state.list = state.list.filter((unit) => unit.id !== action.payload);
        delete state.membersByUnit[action.payload];
        delete state.membersStatus[action.payload];
      })
      .addCase(deleteTeamUnit.rejected, (state, action) => {
        state.mutationStatus.delete = "error";
        state.error = action.payload;
      })
      .addCase(assignMembersToUnit.pending, (state) => {
        state.mutationStatus.member = "loading";
      })
      .addCase(assignMembersToUnit.fulfilled, (state, action) => {
        state.mutationStatus.member = "success";
        const { unitId, data } = action.payload || {};
        if (!unitId) return;
        const formattedMembers = (data?.members || []).map(formatMember);
        state.membersByUnit[unitId] = formattedMembers;
        state.list = state.list.map((unit) =>
          unit.id === unitId ? { ...unit, members: formattedMembers, userCount: formattedMembers.length } : unit
        );
      })
      .addCase(assignMembersToUnit.rejected, (state, action) => {
        state.mutationStatus.member = "error";
        state.error = action.payload;
      })
      .addCase(removeMemberFromUnit.pending, (state) => {
        state.mutationStatus.member = "loading";
      })
      .addCase(removeMemberFromUnit.fulfilled, (state, action) => {
        state.mutationStatus.member = "success";
        const { unitId, userId } = action.payload || {};
        if (!unitId || !userId) return;
        state.membersByUnit[unitId] = (state.membersByUnit[unitId] || []).filter(
          (member) => member.id !== userId
        );
        state.list = state.list.map((unit) =>
          unit.id === unitId
            ? { ...unit, members: state.membersByUnit[unitId], userCount: state.membersByUnit[unitId].length }
            : unit
        );
      })
      .addCase(removeMemberFromUnit.rejected, (state, action) => {
        state.mutationStatus.member = "error";
        state.error = action.payload;
      })
      .addCase(fetchAssignableUsers.pending, (state) => {
        state.assignableStatus = "loading";
        state.assignableError = null;
      })
      .addCase(fetchAssignableUsers.fulfilled, (state, action) => {
        state.assignableStatus = "success";
        state.assignableUsers = action.payload.map((user) => {
          const formatted = formatMember(user);
          return formatted
            ? formatted
            : {
                id: user.id,
                email: user.email,
                name: user.email,
              };
        });
      })
      .addCase(fetchAssignableUsers.rejected, (state, action) => {
        state.assignableStatus = "error";
        state.assignableError = action.payload;
      });
  },
});

export default teamUnitsSlice.reducer;
