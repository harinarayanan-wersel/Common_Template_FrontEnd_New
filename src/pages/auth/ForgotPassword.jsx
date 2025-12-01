import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/app/constants";
import { authService } from "@/services/authService";
import { ButtonSpinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/utils/helpers";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setStatus("Verification code sent! Please check your inbox.");
      
      // Navigate to OTP verification after a short delay
      setTimeout(() => {
        navigate(ROUTES.OTP_VERIFICATION, {
          state: { email },
        });
      }, 1500);
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Failed to send OTP. Please try again.");
      const lowerError = errorMessage.toLowerCase();
      
      if (lowerError.includes("not found")) {
        setError("Email not found. Please check your email address.");
      } else if (
        lowerError.includes("smtp") ||
        lowerError.includes("email service") ||
        lowerError.includes("authentication failed") ||
        lowerError.includes("configuration")
      ) {
        setError("Email service is temporarily unavailable. Please contact support or try again later.");
      } else {
        setError(errorMessage);
      }
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

      {/* Right Side - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 lg:p-8 min-h-[calc(100vh-12rem)] lg:min-h-screen">
        <div className="w-full max-w-md py-10 lg:py-0">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Forgot Password?
          </h1>
          <p className="text-muted-foreground mb-8 text-sm lg:text-base">
            Enter your email address and we'll send you a one-time passcode to
            reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={error ? "text-primary" : "text-foreground"}
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@gromaxx.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                  if (status) setStatus("");
                }}
                disabled={isLoading}
                className={`h-11 border border-border bg-background placeholder:text-muted-foreground ${
                  error
                    ? "border-primary text-primary placeholder:text-primary"
                    : "text-foreground"
                }`}
                required
              />
              {error && (
                <p className="text-sm text-primary">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary text-primary-foreground text-base font-medium transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <ButtonSpinner className="mr-2" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
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
