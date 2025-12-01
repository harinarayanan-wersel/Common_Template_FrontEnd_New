import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../app/constants.js";
import { ButtonSpinner } from "../../components/ui/spinner.jsx";

export const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract token data from URL parameters
        const token = searchParams.get("token");
        const email = searchParams.get("email");
        const permissions = searchParams.get("permissions");
        const tenant_id = searchParams.get("tenant_id");
        const role = searchParams.get("role");
        const user_id = searchParams.get("user_id");
        const profile_url = searchParams.get("profile_url");

        // Check if we have the required token
        if (!token) {
          throw new Error("No token received from Google authentication");
        }

        // Prepare token data object
        const tokenData = {
          token,
          email,
          permissions,
          tenant_id,
          role,
          user_id,
          profile_url,
        };

        // Call the callback handler which will dispatch the login action
        await googleCallback(tokenData);
        
        // Navigation to dashboard is handled by googleCallback
      } catch (error) {
        console.error("Google callback error:", error);
        setError(error.message || "Authentication failed. Please try again.");
        
        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          navigate(ROUTES.SIGNIN);
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, googleCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-primary">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Authentication Failed
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to sign-in page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <ButtonSpinner className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Completing Sign In...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we complete your Google authentication.
        </p>
      </div>
    </div>
  );
};





