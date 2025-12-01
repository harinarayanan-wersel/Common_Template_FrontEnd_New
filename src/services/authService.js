/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import api from "./api.js";
import { endpoints } from "../config/apiConfig.js";

export const authService = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise} User data and access token
   */
  login: async (email, password) => {
    try {
      const response = await api.post(endpoints.auth.login, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      // Extract error message from response
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Login failed";
      throw new Error(errorMessage);
    }
  },

  /**
   * Register new user
   * @param {string} email
   * @param {string} password
   * @returns {Promise} User data and access token
   */
  signup: async (email, password) => {
    const response = await api.post(endpoints.auth.signup, {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    const response = await api.post(endpoints.auth.logout);
    return response.data;
  },

  /**
   * Refresh access token
   * Refresh token is sent automatically via HTTP-only cookie
   * @returns {Promise} New access token
   */
  refreshToken: async () => {
    const response = await api.post(endpoints.auth.refresh);
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise} User data
   */
  getCurrentUser: async () => {
    const response = await api.get(endpoints.auth.me);
    return response.data;
  },

  /**
   * Send OTP for forgot password
   * @param {string} email
   * @returns {Promise}
   */
  forgotPassword: async (email) => {
    const response = await api.post(endpoints.auth.forgotPassword, {
      email,
    });
    return response.data;
  },

  /**
   * Resend OTP
   * @param {string} email
   * @returns {Promise}
   */
  resendOtp: async (email) => {
    const response = await api.post(endpoints.auth.resendOtp, {
      email,
    });
    return response.data;
  },

  /**
   * Verify OTP
   * @param {string} email
   * @param {string} otp
   * @returns {Promise}
   */
  verifyOtp: async (email, otp) => {
    const response = await api.post(endpoints.auth.verifyOtp, {
      email,
      otp,
    });
    return response.data;
  },

  /**
   * Reset password after OTP verification
   * @param {string} email
   * @param {string} newPassword
   * @returns {Promise}
   */
  resetPassword: async (email, newPassword) => {
    const response = await api.post(endpoints.auth.resetPassword, {
      email,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Get Google OAuth authorization URL
   * @returns {Promise} Object with auth_url
   */
  getGoogleAuthUrl: async () => {
    try {
      const response = await api.get(endpoints.auth.googleAuthUrl);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to get Google auth URL";
      throw new Error(errorMessage);
    }
  },

  /**
   * Handle Google OAuth callback
   * This is called by the backend redirect, not directly by the frontend
   * The backend redirects to frontend with token in URL params
   * @param {string} code - Authorization code from Google
   * @returns {Promise}
   */
  handleGoogleCallback: async (code) => {
    try {
      const response = await api.post(endpoints.auth.googleCallback, {
        code,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Google authentication failed";
      throw new Error(errorMessage);
    }
  },
};

