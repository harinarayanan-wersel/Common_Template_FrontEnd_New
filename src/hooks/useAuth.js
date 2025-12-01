import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  login,
  signup,
  logout,
  refreshToken,
  getCurrentUser,
  clearCredentials,
  loginWithGoogle,
} from "../features/auth/slices/authSlice.js";
import { authService } from "../services/authService.js";
import { ROUTES } from "../app/constants.js";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const handleLogin = async (email, password) => {
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (email, password) => {
    try {
      await dispatch(signup({ email, password })).unwrap();
      // Navigate to login after successful signup
      navigate(ROUTES.SIGNIN);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch(clearCredentials());
    } finally {
      navigate(ROUTES.SIGNIN);
    }
  };

  const handleRefreshToken = async () => {
    try {
      await dispatch(refreshToken()).unwrap();
      return true;
    } catch (error) {
      dispatch(clearCredentials());
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      await dispatch(getCurrentUser()).unwrap();
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Get Google OAuth URL from backend
      const { auth_url } = await authService.getGoogleAuthUrl();
      // Redirect to Google OAuth page
      window.location.href = auth_url;
    } catch (error) {
      throw error;
    }
  };

  const handleGoogleCallback = async (tokenData) => {
    try {
      await dispatch(loginWithGoogle(tokenData)).unwrap();
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      throw error;
    }
  };

  return {
    ...auth,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    refreshUser,
    googleLogin: handleGoogleLogin,
    googleCallback: handleGoogleCallback,
  };
};

