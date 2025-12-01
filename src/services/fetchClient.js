/**
 * Centralized Fetch API client with token management, refresh flow, and 401 retry
 */

import { apiConfig, endpoints } from "../config/apiConfig.js";
import { storage } from "./storage.js";
import { store } from "../app/store.js";
import {
  setCredentials,
  clearCredentials,
} from "../features/auth/slices/authSlice.js";
import { STORAGE_KEYS } from "../app/constants.js";

class FetchClient {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.timeout = apiConfig.timeout;
    this.refreshPromise = null;
    this.isRefreshing = false;
  }

  /**
   * Get access token from storage
   */
  getAccessToken() {
    const state = store.getState?.();
    const reduxToken = state?.auth?.accessToken;
    if (reduxToken) {
      return reduxToken;
    }
    return storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken() {
    return storage.get("refreshToken");
  }

  /**
   * Set access token in storage
   */
  setAccessToken(token) {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Set refresh token in storage
   */
  setRefreshToken(token) {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual refresh request
   */
  async _performRefresh(refreshToken) {
    try {
      const response = await fetch(`${this.baseURL}${endpoints.auth.refresh}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      
      if (data.accessToken) {
        this.setAccessToken(data.accessToken);
        store.dispatch(
          setCredentials({
            accessToken: data.accessToken,
            user: store.getState()?.auth?.user,
          })
        );
      }
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken);
      }

      return data.accessToken;
    } catch (error) {
      this.clearTokens();
      store.dispatch(clearCredentials());
      // Redirect to login or trigger logout
      if (typeof window !== "undefined") {
        window.location.href = "/signup";
      }
      throw error;
    }
  }

  /**
   * Create timeout promise
   */
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), timeout);
    });
  }

  /**
   * Main fetch method with retry logic
   */
  async fetch(url, options = {}) {
    const {
      retryOn401 = true,
      retryCount = 1,
      timeout = this.timeout,
      params,
      ...fetchOptions
    } = options;

    // Build full URL
    let fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;
    
    // Add query parameters for GET requests
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullURL += (fullURL.includes("?") ? "&" : "?") + queryString;
      }
    }

    // Get access token and attach to headers
    const accessToken = this.getAccessToken();
    const headers = {
      ...apiConfig.headers,
      ...fetchOptions.headers,
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // Prepare fetch options
    const requestOptions = {
      ...fetchOptions,
      headers,
    };

    // Perform request with timeout
    try {
      const fetchPromise = fetch(fullURL, requestOptions);
      const timeoutPromise = this.createTimeoutPromise(timeout);
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Handle 401 Unauthorized
      if (response.status === 401 && retryOn401 && retryCount > 0) {
        try {
          // Attempt to refresh token
          await this.refreshAccessToken();
          
          // Retry the original request with new token
          const newAccessToken = this.getAccessToken();
          if (newAccessToken) {
            headers.Authorization = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(fullURL, {
              ...requestOptions,
              headers,
            });
            return this.handleResponse(retryResponse);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          this.clearTokens();
          throw new Error("Authentication failed. Please login again.");
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      if (error.message === "Request timeout") {
        throw new Error("Request timeout. Please try again.");
      }
      throw error;
    }
  }

  /**
   * Handle response and parse JSON
   */
  async handleResponse(response) {
    const contentType = response.headers.get("content-type");
    const isJSON = contentType && contentType.includes("application/json");

    let data;
    if (isJSON) {
      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.fetch(url, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  async patch(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.fetch(url, {
      ...options,
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const fetchClient = new FetchClient();
export default fetchClient;

