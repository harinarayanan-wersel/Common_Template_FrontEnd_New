import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice.js";
import chatReducer from "../features/chat/slices/chatSlice.js";
import usersReducer from "../features/users/slices/usersSlice.js";
import agentsReducer from "../features/agents/slices/agentsSlice.js";
import rolesReducer from "../features/roles/slices/rolesSlice.js";
import teamUnitsReducer from "../features/team-units/slices/teamUnitsSlice.js";

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  users: usersReducer,
  agents: agentsReducer,
  roles: rolesReducer,
  teamUnits: teamUnitsReducer,
});

export default rootReducer;

