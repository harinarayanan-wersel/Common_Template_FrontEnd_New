/**
 * AuthProvider Component
 * Handles auto-refresh token on page reload
 * Should wrap the entire app
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refreshToken } from "../../features/auth/slices/authSlice.js";
import { FullPageSpinner } from "../ui/spinner.jsx";

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // If we have user data but no access token, try to refresh
      if (user && !accessToken) {
        try {
          await dispatch(refreshToken()).unwrap();
        } catch (error) {
          // Refresh failed - user will be redirected to login by PrivateRoute
          console.log("Token refresh failed on page load");
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [dispatch, user, accessToken]);

  // Show spinner while initializing auth
  if (isInitializing) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
};

