/**
 * Axios API Client with automatic token refresh and 401 handling
 * - Access token stored in Redux memory only
 * - Refresh token in HTTP-only cookie (handled by backend)
 * - Auto-refresh on 401 responses
 */

import axios from "axios";
import { apiConfig } from "../config/apiConfig.js";
import { store } from "../app/store.js";
import { setCredentials, clearCredentials } from "../features/auth/slices/authSlice.js";

// Create axios instance
const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: true, // Important: enables cookies (for refresh_token)
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: Attach access token from Redux
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth?.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh token logic for auth endpoints (login, signup, forgot password, etc.)
    // These endpoints don't require authentication and shouldn't trigger refresh
    const authEndpoints = ['/auth/login', '/auth/signup', '/auth/register', '/auth/forgot-password', '/auth/resend-otp', '/auth/verify-otp', '/auth/reset-password'];
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

    // If error is 401 and we haven't tried to refresh yet, and it's NOT an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint (refresh_token is in cookie)
        // Use axios directly to avoid interceptor loop
        const response = await axios.post(
          `${apiConfig.baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const { access_token } = response.data;

        // Update Redux with new access token
        store.dispatch(
          setCredentials({
            accessToken: access_token,
            user: store.getState().auth?.user,
          })
        );

        // Process queued requests
        processQueue(null, access_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError, null);
        store.dispatch(clearCredentials());

        // Redirect to login
        if (window.location.pathname !== "/signin" && window.location.pathname !== "/register") {
          window.location.href = "/signin";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

