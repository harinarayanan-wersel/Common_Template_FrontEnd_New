import { createBrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTES } from "./constants.js";
import { MainLayout } from "../components/layout/MainLayout.jsx";
import { LoginPage } from "../features/auth/pages/LoginPage.jsx";
import { RegisterPage } from "../features/auth/pages/RegisterPage.jsx";
import { SignIn } from "../pages/auth/SignIn.jsx";
import { ForgotPassword } from "../pages/auth/ForgotPassword.jsx";
import { OtpVerification } from "../pages/auth/OtpVerification.jsx";
import { ResetPassword } from "../pages/auth/ResetPassword.jsx";
import { ChatPage } from "../features/chat/components/ChatPage.jsx";
import { GoogleCallback } from "../pages/auth/GoogleCallback.jsx";

import { UsersPage } from "../features/users/pages/UsersPage.jsx";
import { AgentsPage } from "../features/agents/pages/AgentsPage.jsx";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { RolesPage } from "../features/roles/pages/RolesPage.jsx";
import { TeamUnitsPage } from "../features/team-units/pages/TeamUnitsPage.jsx";

// Private Route Component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to={ROUTES.SIGNIN} replace />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return !isAuthenticated ? (
    children
  ) : (
    <Navigate to={ROUTES.DASHBOARD} replace />
  );
};

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.SIGNIN,
    element: (
      <PublicRoute>
        <SignIn />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.OTP_VERIFICATION,
    element: (
      <PublicRoute>
        <OtpVerification />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: ROUTES.GOOGLE_CALLBACK,
    element: <GoogleCallback />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.CHAT,
        element: <ChatPage />,
      },
      {
        path: ROUTES.USERS,
        element: <UsersPage />,
      },
      {
        path: ROUTES.ROLES,
        element: <RolesPage />,
      },
      {
        path: ROUTES.TEAM_UNITS,
        element: <TeamUnitsPage />,
      },
      {
        path: ROUTES.AGENTS,
        element: <AgentsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);
