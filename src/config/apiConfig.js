/**
 * API configuration
 */

import { env } from "./env.js";

export const apiConfig = {
  baseURL: env.API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

export const endpoints = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    register: "/auth/signup", // Alias for signup
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
    forgotPassword: "/auth/forgot-password",
    resendOtp: "/auth/resend-otp",
    verifyOtp: "/auth/verify-otp",
    resetPassword: "/auth/reset-password",
    googleAuthUrl: "/auth/google-auth-url",
    googleCallback: "/auth/google/callback",
  },
  users: {
    list: "/user-management/users",
    detail: (id) => `/user-management/users/${id}`,
    create: "/user-management/users",
    update: (id) => `/user-management/users/${id}`,
    delete: (id) => `/user-management/users/${id}`,
    assignable: "/user-management/users/assignable",
  },
  roles: {
    list: "/user-management/roles",
    detail: (id) => `/user-management/roles/${id}`,
    create: "/user-management/roles",
    update: (id) => `/user-management/roles/${id}`,
    delete: (id) => `/user-management/roles/${id}`,
    permissions: "/user-management/permissions",
    assignPermissions: (id) => `/user-management/roles/${id}/permissions`,
    updatePermissions: (id) => `/user-management/roles/${id}/permissions`,
    unassignPermission: (roleId, permissionId) =>
      `/user-management/roles/${roleId}/permissions/${permissionId}`,
  },
  chat: {
    list: "/chat",
    detail: (id) => `/chat/${id}`,
    create: "/chat",
    update: (id) => `/chat/${id}`,
    delete: (id) => `/chat/${id}`,
    messages: (id) => `/chat/${id}/messages`,
  },
  agents: {
    list: "/agents",
    detail: (id) => `/agents/${id}`,
    create: "/agents",
    update: (id) => `/agents/${id}`,
    delete: (id) => `/agents/${id}`,
  },
  teamUnits: {
    list: "/user-management/team-units",
    tree: "/user-management/team-units/tree",
    detail: (id) => `/user-management/team-units/${id}`,
    create: "/user-management/team-units",
    update: (id) => `/user-management/team-units/${id}`,
    delete: (id) => `/user-management/team-units/${id}`,
    assignMembers: (unitId) => `/user-management/team-units/${unitId}/members`,
    assignSingle: (unitId, userId) => `/user-management/team-units/${unitId}/users/${userId}`,
    removeMember: (userId) => `/user-management/team-units/users/${userId}`,
  },
};

