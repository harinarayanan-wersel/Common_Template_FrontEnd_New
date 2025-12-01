import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/app/constants";
import { useAuth } from "@/hooks/useAuth";
import { ButtonSpinner } from "@/components/ui/spinner";

// Social Icons Components
const GoogleIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="10" height="10" fill="#f25022" />
    <rect x="12" width="10" height="10" fill="#7fba00" />
    <rect y="12" width="10" height="10" fill="#00a4ef" />
    <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
  </svg>
);

// Gromaxx Logo Component
// const GromaxxLogo = () => (
//   <div className="flex items-center gap-2 mb-8">
//     <div className="grid grid-cols-2 gap-1 w-8 h-8">
//       <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
//       <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
//       <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
//       <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
//       <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
//       <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
//       <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
//       <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
//     </div>
//     <span className="text-2xl font-bold text-gray-900">Gromaxx</span>
//   </div>
// );

export const LoginPage = () => {
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
  const { signup, status } = useAuth();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", general: "" });

    if (!validateForm()) {
      return;
    }

    try {
      await signup(formData.email, formData.password);
      // Navigation handled by useAuth hook (goes to login page)
    } catch (error) {
      const errorMessage = error || "Registration failed. Please try again.";
      
      // Check if it's an email already exists error
      if (errorMessage.toLowerCase().includes("already") || errorMessage.toLowerCase().includes("exists")) {
        setErrors({
          email: "This email is already registered",
          password: "",
          general: "",
        });
      } else {
        setErrors({
          email: "",
          password: "",
          general: errorMessage,
        });
      }
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
    // TODO: Implement social login
  };

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side - Hero Image (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 overflow-hidden">
        {/* Abstract 3D Illustration Background */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative w-full h-full">
            {/* Background circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
            <div className="absolute top-40 right-20 w-48 h-48 bg-teal-400/30 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 bg-orange-300/30 rounded-full blur-xl"></div>

            {/* 3D Spheres */}
            <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-white rounded-full shadow-2xl transform rotate-12"></div>
            <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-teal-400 rounded-full shadow-xl"></div>
            <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-orange-300 rounded-full shadow-2xl"></div>
            <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-white rounded-full shadow-lg"></div>

            {/* Arched doorway */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-48">
              <div className="w-full h-full bg-white/90 rounded-t-[50%] flex items-end justify-center pb-4">
                <div className="w-32 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-4 lg:p-8 min-h-[calc(100vh-12rem)] lg:min-h-screen">
        <div className="w-full max-w-md py-8 lg:py-0">
          {/* <GromaxxLogo /> */}

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Sign up to Gromaxx Dashboard
          </h1>
          <p className="text-gray-600 mb-8 text-sm lg:text-base">
            Sign up with social account or enter your details.
          </p>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border-gray-200 h-11"
              onClick={() => handleSocialLogin("Google")}
            >
              <GoogleIcon />
              <span className="ml-2 hidden sm:inline">Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border-gray-200 h-11"
              onClick={() => handleSocialLogin("Microsoft")}
            >
              <MicrosoftIcon />
              <span className="ml-2 hidden sm:inline">Microsoft</span>
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">
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
                className={`bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 h-11 ${
                  errors.email
                    ? "border-red-500 dark:border-red-500 placeholder:text-red-400 dark:placeholder:text-red-400"
                    : ""
                }`}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 pr-10 h-11 ${
                    errors.password
                      ? "border-red-500 dark:border-red-500 placeholder:text-red-400 dark:placeholder:text-red-400"
                      : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
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
                <p className="text-sm text-red-500 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#605dff] hover:bg-[#504dff] dark:bg-[#605dff] dark:hover:bg-[#504dff] text-white h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <ButtonSpinner className="mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  <User className="h-5 w-5 mr-2" />
                  Sign Up
                </>
              )}
            </Button>
          </form>

          {/* Terms and Privacy */}
          <p className="mt-6 text-xs text-gray-600 text-center leading-relaxed">
            By confirming your email, you agree to our{" "}
            <Link to="#" className="text-blue-500">
              Terms of Service
            </Link>{" "}
            and that you have read and understood our{" "}
            <Link to="#" className="text-blue-500">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to={ROUTES.SIGNIN}
              className="text-blue-500 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
