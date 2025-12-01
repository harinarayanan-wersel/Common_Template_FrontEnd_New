import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../../services/authService.js";
import { storage } from "../../../services/storage.js";
import { STORAGE_KEYS } from "../../../app/constants.js";
import { getErrorMessage } from "../../../utils/helpers.js";

// Initial state
// IMPORTANT: accessToken stored ONLY in Redux memory (not localStorage)
// refreshToken is in HTTP-only cookie (handled by backend)
const persistedUser = storage.get(STORAGE_KEYS.USER, null);
const persistedAccessToken = storage.get(STORAGE_KEYS.ACCESS_TOKEN, null);

const mapUserPayload = (payload = {}) => {
  const roles = payload.roles || payload.user_roles || [];
  const permissions = payload.final_permissions || payload.permissions || [];
  return {
    id: payload.user_id ?? payload.id ?? payload.user?.id ?? null,
    email: payload.email ?? payload.user?.email ?? "",
    tenant_id: payload.tenant_id ?? payload.user?.tenant_id ?? null,
    role: payload.role ?? payload.primary_role ?? null,
    roles,
    permissions,
    profile_url: payload.profile_url ?? payload.avatar_url ?? null,
    first_name: payload.first_name ?? payload.user?.first_name ?? null,
    last_name: payload.last_name ?? payload.user?.last_name ?? null,
    user_direct_permissions: payload.user_direct_permissions || payload.direct_permissions || [],
  };
};

const initialState = {
  user: persistedUser,
  roles: persistedUser?.roles || [],
  finalPermissions: persistedUser?.permissions || [],
  accessToken: persistedAccessToken,
  isAuthenticated: Boolean(persistedAccessToken),
  status: "idle",
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login(email, password);
      const user = mapUserPayload({
        user_id: data.user_id,
        email: data.email,
        tenant_id: data.tenant_id,
        role: data.role,
        roles: data.roles,
        final_permissions: data.final_permissions,
        permissions: data.permissions,
        profile_url: data.profile_url,
      });
      return {
        accessToken: data.access_token,
        user,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Login failed");
      return rejectWithValue(errorMessage);
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authService.signup(email, password);
      const user = mapUserPayload({
        id: data.id,
        email: data.email,
        tenant_id: data.tenant_id,
        role: data.role,
        roles: data.roles,
        final_permissions: data.final_permissions,
        permissions: data.permissions,
        profile_url: data.profile_url,
      });
      return {
        accessToken: data.access_token,
        user,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Signup failed");
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      // Even if logout fails on backend, clear local state
      return true;
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.refreshToken();
      return {
        accessToken: data.access_token,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Token refresh failed");
      return rejectWithValue(errorMessage);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getCurrentUser();
      return mapUserPayload(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to get user");
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (tokenData, { rejectWithValue }) => {
    try {
      // tokenData comes from URL params after Google OAuth redirect
      // Format: { token, email, permissions, tenant_id, role }
      const permissions = tokenData.permissions 
        ? (typeof tokenData.permissions === 'string' 
            ? JSON.parse(tokenData.permissions) 
            : tokenData.permissions)
        : [];
      const user = mapUserPayload({
        user_id: tokenData.user_id,
        email: tokenData.email,
        tenant_id: tokenData.tenant_id,
        role: tokenData.role,
        roles: tokenData.roles,
        permissions,
        profile_url: tokenData.profile_url,
      });

      return {
        accessToken: tokenData.token,
        user,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Google login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      if (user) {
        const normalizedUser = mapUserPayload(user);
        state.user = normalizedUser;
        state.roles = normalizedUser.roles || [];
        state.finalPermissions = normalizedUser.permissions || [];
        storage.set(STORAGE_KEYS.USER, normalizedUser);
      }
      if (accessToken) {
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.roles = [];
      state.finalPermissions = [];
      state.accessToken = null; // Clear from memory
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear user from localStorage (accessToken was never there)
      storage.remove(STORAGE_KEYS.USER);
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload.user;
        state.roles = action.payload.user.roles || [];
        state.finalPermissions = action.payload.user.permissions || [];
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store user in localStorage (but NOT accessToken)
        storage.set(STORAGE_KEYS.USER, action.payload.user);
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload.user;
        state.roles = action.payload.user.roles || [];
        state.finalPermissions = action.payload.user.permissions || [];
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store user in localStorage (but NOT accessToken)
        storage.set(STORAGE_KEYS.USER, action.payload.user);
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.roles = [];
        state.finalPermissions = [];
        state.accessToken = null; // Clear from memory
        state.isAuthenticated = false;
        state.error = null;
        
        // Clear user from localStorage (accessToken was never there)
        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout fails, clear local state
        state.status = "idle";
        state.user = null;
        state.roles = [];
        state.finalPermissions = [];
        state.accessToken = null;
        state.isAuthenticated = false;
        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        // Don't set loading state for refresh to avoid UI flicker
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        // Update accessToken in memory only
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        // Refresh failed - clear everything
        state.user = null;
        state.roles = [];
        state.finalPermissions = [];
        state.accessToken = null;
        state.isAuthenticated = false;
        storage.remove(STORAGE_KEYS.USER);
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload;
        state.roles = action.payload.roles || [];
        state.finalPermissions = action.payload.permissions || [];
        storage.set(STORAGE_KEYS.USER, action.payload);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      });

    // Google OAuth Login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload.user;
        state.roles = action.payload.user.roles || [];
        state.finalPermissions = action.payload.user.permissions || [];
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        
        // Store user in localStorage (but NOT accessToken)
        storage.set(STORAGE_KEYS.USER, action.payload.user);
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const {
  setCredentials,
  clearCredentials,
  setError,
  clearError,
} =
  authSlice.actions;

export default authSlice.reducer;


