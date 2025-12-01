import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/app/constants";
import { useAuth } from "@/hooks/useAuth";
import { ButtonSpinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/utils/helpers";

// Social Icons Components
const GoogleIcon = () => (
  <svg
    className="h-5 w-5 text-primary"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="currentColor"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="currentColor"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="currentColor"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="currentColor"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg
    className="h-5 w-5 text-primary"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="10" height="10" fill="currentColor" />
    <rect x="12" width="10" height="10" fill="currentColor" />
    <rect y="12" width="10" height="10" fill="currentColor" />
    <rect x="12" y="12" width="10" height="10" fill="currentColor" />
  </svg>
);

export const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, status, googleLogin } = useAuth();

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
        general: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", general: "" });

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      // Navigation handled by useAuth hook
    } catch (error) {
      // Extract error message - handle both string and object errors
      const errorMessage = getErrorMessage(error, "Login failed. Please try again.");
      const lowerError = errorMessage.toLowerCase();
      
      // Check for password-related errors
      if (
        lowerError.includes("password") ||
        lowerError.includes("incorrect") ||
        lowerError.includes("wrong password") ||
        lowerError.includes("invalid password")
      ) {
        setErrors({
          email: "",
          password: "Password is incorrect. Please try again.",
          general: "",
        });
      }
      // Check for account not found errors
      else if (
        lowerError.includes("not found") ||
        lowerError.includes("account not found") ||
        lowerError.includes("email not found") ||
        lowerError.includes("user not found") ||
        lowerError.includes("please register")
      ) {
        setErrors({
          email: "Account not found. Please check your email or sign up.",
          password: "",
          general: "",
        });
      }
      // Check for invalid credentials (general)
      else if (
        lowerError.includes("invalid") ||
        lowerError.includes("unauthorized")
      ) {
        setErrors({
          email: "",
          password: "Invalid email or password. Please try again.",
          general: "",
        });
      }
      // Other errors show in general box
      else {
        setErrors({
          email: "",
          password: "",
          general: errorMessage,
        });
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    if (provider === "Google") {
      try {
        await googleLogin();
      } catch (error) {
        setErrors({
          email: "",
          password: "",
          general: error.message || "Google sign-in failed. Please try again.",
        });
      }
    } else {
      console.log(`Social login with ${provider} not yet implemented`);
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side - Hero Image (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-r-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-2xl h-full">
                  <div className="absolute top-1/4 left-0 w-64 h-96 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10 rounded-full blur-3xl transform -rotate-12"></div>
                  <div className="absolute bottom-1/4 right-0 w-80 h-[500px] bg-gradient-to-l from-primary/30 via-accent/20 to-secondary/20 rounded-full blur-3xl transform rotate-12"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/30 via-background/10 to-transparent"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-64">
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20 rounded-3xl backdrop-blur-sm border border-border/20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 lg:p-8 min-h-[calc(100vh-12rem)] lg:min-h-screen relative">
        <div className="w-full max-w-md py-8 lg:py-0">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Stay comfortable. Stay in control!
          </h1>
          <p className="text-muted-foreground mb-8 text-sm lg:text-base">
            Sign in with social account or enter your details
          </p>

          {/* General Error Message */}
          {errors.general && (
            <p className="mb-6 text-sm text-primary">{errors.general}</p>
          )}

          {/* Social Login Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 border border-border bg-background text-foreground transition hover:bg-muted"
              onClick={() => handleSocialLogin("Google")}
              disabled={isLoading}
            >
              <GoogleIcon />
              <span className="ml-2 hidden sm:inline">Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 border border-border bg-background text-foreground transition hover:bg-muted"
              onClick={() => handleSocialLogin("Microsoft")}
              disabled={isLoading}
            >
              <MicrosoftIcon />
              <span className="ml-2 hidden sm:inline">Microsoft</span>
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={errors.email ? "text-primary" : "text-foreground"}
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@gromaxx.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`h-11 border border-border bg-background placeholder:text-muted-foreground ${
                  errors.email
                    ? "border-primary text-primary placeholder:text-primary"
                    : "text-foreground"
                }`}
                required
              />
              {errors.email && (
                <p className="text-sm text-primary">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={errors.password ? "text-primary" : "text-foreground"}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Type password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`h-11 border border-border bg-background placeholder:text-muted-foreground pr-10 ${
                    errors.password
                      ? "border-primary text-primary placeholder:text-primary"
                      : "text-foreground"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-primary focus:outline-none disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-primary">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-primary hover:underline"
              >
                Trust & Security Focused
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-primary-foreground text-base font-medium transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <ButtonSpinner className="mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-primary hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
