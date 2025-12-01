import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/app/constants";
import { authService } from "@/services/authService";
import { ButtonSpinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/utils/helpers";

export const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  const validatePassword = (password) => {
    // Minimum 8 characters, at least one letter and one number
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordPattern.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError("");
    if (status) setStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one letter and one number."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!email) {
      setError("Email not found. Please go back and try again.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, formData.password);
      setStatus("Password reset successfully! Redirecting to sign in...");

      setTimeout(() => {
        navigate(ROUTES.SIGNIN);
      }, 1500);
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Failed to reset password. Please try again.");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side - Hero Image (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-r-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-2xl h-full">
                  <div className="absolute top-1/4 left-0 w-64 h-96 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10 rounded-full blur-3xl transform -rotate-12" />
                  <div className="absolute bottom-1/4 right-0 w-80 h-[500px] bg-gradient-to-l from-primary/30 via-accent/20 to-secondary/20 rounded-full blur-3xl transform rotate-12" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/30 via-background/10 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-64">
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20 rounded-3xl backdrop-blur-sm border border-border/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 lg:p-8 min-h-[calc(100vh-12rem)] lg:min-h-screen">
        <div className="w-full max-w-md py-10 lg:py-0">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground mb-8 text-sm lg:text-base">
            {email
              ? `Enter your new password for ${email}.`
              : "Enter your new password."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={error ? "text-primary" : "text-foreground"}
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters with letter and number"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`h-11 border border-border bg-background placeholder:text-muted-foreground pr-10 ${
                    error
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
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className={error ? "text-primary" : "text-foreground"}
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`h-11 border border-border bg-background placeholder:text-muted-foreground pr-10 ${
                    error
                      ? "border-primary text-primary placeholder:text-primary"
                      : "text-foreground"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-primary focus:outline-none disabled:opacity-50"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-primary">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-primary-foreground text-base font-medium transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <ButtonSpinner className="mr-2" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Reset Password
                </>
              )}
            </Button>

            {status && (
              <p className="text-center text-sm text-primary">
                {status}
              </p>
            )}
          </form>

          <div className="mt-8 text-center">
            <Link
              to={ROUTES.SIGNIN}
              className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
