import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/app/constants";
import { authService } from "@/services/authService";
import { ButtonSpinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/utils/helpers";

const OTP_LENGTH = 6;

export const OtpVerification = () => {
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const nextValues = [...otpValues];
    nextValues[index] = value;
    setOtpValues(nextValues);
    setError("");
    setStatus("");

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otpValues.join("");

    if (code.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code sent to your email.`);
      return;
    }

    setIsLoading(true);
    setError("");
    setStatus("");

    try {
      await authService.verifyOtp(email, code);
      setStatus("OTP verified! Redirecting...");

      setTimeout(() => {
        navigate(ROUTES.RESET_PASSWORD, {
          state: { email },
        });
      }, 1200);
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Invalid OTP. Please try again.");

      if (errorMessage.toLowerCase().includes("expired")) {
        setError("OTP has expired. Please request a new one.");
      } else if (errorMessage.toLowerCase().includes("invalid")) {
        setError("Invalid OTP code. Please check and try again.");
      } else {
        setError(errorMessage);
      }
      // Clear OTP inputs on error
      setOtpValues(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email not found. Please go back and try again.");
      return;
    }

    setIsResending(true);
    setError("");
    setStatus("");

    try {
      await authService.resendOtp(email);
      setStatus("New code sent! Please check your inbox.");
      setOtpValues(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Failed to resend OTP. Please try again.");
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
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

      <div className="flex-1 flex items-center justify-center bg-background p-4 lg:p-8 min-h-[calc(100vh-12rem)] lg:min-h-screen">
        <div className="w-full max-w-md py-10 lg:py-0">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Verify OTP
          </h1>
          <p className="text-muted-foreground mb-8 text-sm lg:text-base">
            {email
              ? `Enter the 6-digit code we sent to ${email}.`
              : "Enter the 6-digit code we sent to your email."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className={error ? "text-primary" : "text-foreground"}>
                One-Time Passcode
              </Label>
              <div className="flex gap-3">
                {otpValues.map((value, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={value}
                    inputMode="numeric"
                    maxLength={1}
                    disabled={isLoading}
                    className={`h-12 w-full text-center text-lg font-semibold border border-border bg-background ${
                      error
                        ? "border-primary text-primary"
                        : "text-foreground"
                    }`}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    required={index === 0}
                  />
                ))}
              </div>
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
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            {status && (
              <p className="text-center text-sm text-primary">
                {status}
              </p>
            )}
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isLoading}
              className="font-medium text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-muted-foreground hover:text-foreground"
            >
              Change email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
