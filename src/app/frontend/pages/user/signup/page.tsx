"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/../firebaseconfig";
import Button from "@/app/frontend/components/ui/Button";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailExistsToast, setEmailExistsToast] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firebase?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validateEmail(email: string): string | undefined {
    if (!email) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  }

  function validatePassword(password: string): string | undefined {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return undefined;
  }

  function validateConfirmPassword(
    password: string,
    confirmPassword: string
  ): string | undefined {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return undefined;
  }

  function handleBlur(
    field: "email" | "password" | "confirmPassword",
    value: string,
    form?: HTMLFormElement
  ) {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (field === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    } else if (field === "confirmPassword" && form) {
      const password = new FormData(form).get("password") as string;
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(password, value),
      }));
    }
  }

  function handleChange(
    field: "email" | "password" | "confirmPassword",
    value: string,
    form?: HTMLFormElement
  ) {
    // Set touched immediately on first change
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (field === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    } else if (field === "confirmPassword" && form) {
      const password = new FormData(form).get("password") as string;
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(password, value),
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword
    );

    setTouched({ email: true, password: true, confirmPassword: true });
    setErrors({
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // If there are errors, don't submit
    if (emailError || passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User created successfully:", userCredential.user.email);

      // Store user data in Firestore
      await setDoc(doc(db, "user", userCredential.user.uid), {
        email: email,
        createdAt: new Date().toISOString(),
        uid: userCredential.user.uid,
      });
      console.log("User data stored in Firestore");

      // Send email verification
      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent to:", email);

      // Redirect to email confirmation page with email as query parameter
      router.push(
        `/frontend/pages/user/emailconfirmation?email=${encodeURIComponent(
          email
        )}`
      );
    } catch (error: unknown) {
      // Handle Firebase Auth errors
      let errorMessage = "An error occurred during sign up";

      const firebaseError = error as { code?: string; message?: string };

      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setEmailExistsToast(true);
          // Auto-hide toast after 5 seconds
          setTimeout(() => setEmailExistsToast(false), 5000);
          return; // Don't set firebase error, show toast instead
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          break;
        default:
          errorMessage =
            firebaseError.message || "An error occurred during sign up";
      }

      setErrors((prev) => ({ ...prev, firebase: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-10 sm:p-4">
      {/* Glass Card */}
      <div className="relative w-full max-w-xs sm:max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-5 sm:px-8 sm:py-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-5 sm:mb-8 text-center">
          <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[rgb(18,135,173)]/20 text-[rgb(18,135,173)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 sm:h-6 sm:w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Create Account
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-400">
            Enter your details to get started
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:gap-5"
          noValidate
        >
          {/* Firebase Error Display */}
          {errors.firebase && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-2 sm:p-3 text-center text-xs sm:text-sm text-red-500">
              {errors.firebase}
            </div>
          )}

          {/* Email Input */}
          <div className="group relative">
            {/* Email Exists Toast Notification */}
            {emailExistsToast && (
              <div className="absolute -top-12 left-0 right-0 z-10 animate-[slideDown_0.3s_ease-out] rounded-lg border border-red-500/50 bg-red-500/90 px-3 py-1.5 sm:px-4 sm:py-2 text-center text-xs sm:text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  This email is already registered
                  <button
                    type="button"
                    onClick={() => setEmailExistsToast(false)}
                    className="ml-2 rounded-full p-0.5 hover:bg-white/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-3 w-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder=" "
              onBlur={(e) => handleBlur("email", e.target.value)}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`peer w-full rounded-lg border bg-white/5 px-3 py-1.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white outline-none transition-all focus:bg-white/10 focus:ring-1 ${
                errors.email && touched.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-white/10 focus:border-[rgb(18,135,173)] focus:ring-[rgb(18,135,173)]"
              }`}
            />
            <label
              htmlFor="email"
              className={`pointer-events-none absolute left-3 sm:left-4 top-1.5 sm:top-3 text-xs sm:text-sm transition-all peer-focus:-top-2 sm:peer-focus:-top-2.5 peer-focus:bg-[#1a1d21]/90 peer-focus:backdrop-blur-md peer-focus:px-1 peer-focus:text-[10px] sm:peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 sm:peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21]/90 peer-[:not(:placeholder-shown)]:backdrop-blur-md peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-[10px] sm:peer-[:not(:placeholder-shown)]:text-xs ${
                errors.email && touched.email
                  ? "text-red-500 peer-focus:text-red-500"
                  : "text-gray-400 peer-focus:text-[rgb(18,135,173)]"
              }`}
            >
              Email address
            </label>
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="group relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder=" "
              onBlur={(e) => handleBlur("password", e.target.value)}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`peer w-full rounded-lg border bg-white/5 px-3 py-1.5 sm:px-4 sm:py-3 pr-10 sm:pr-12 text-xs sm:text-sm text-white outline-none transition-all focus:bg-white/10 focus:ring-1 ${
                errors.password && touched.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-white/10 focus:border-[rgb(18,135,173)] focus:ring-[rgb(18,135,173)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 sm:right-3 top-1.5 sm:top-[14px] text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
            <label
              htmlFor="password"
              className={`pointer-events-none absolute left-3 sm:left-4 top-1.5 sm:top-3 text-xs sm:text-sm transition-all peer-focus:-top-2 sm:peer-focus:-top-2.5 peer-focus:bg-[#1a1d21]/90 peer-focus:backdrop-blur-md peer-focus:px-1 peer-focus:text-[10px] sm:peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 sm:peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21]/90 peer-[:not(:placeholder-shown)]:backdrop-blur-md peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-[10px] sm:peer-[:not(:placeholder-shown)]:text-xs ${
                errors.password && touched.password
                  ? "text-red-500 peer-focus:text-red-500"
                  : "text-gray-400 peer-focus:text-[rgb(18,135,173)]"
              }`}
            >
              Password
            </label>
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="group relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder=" "
              onBlur={(e) =>
                handleBlur(
                  "confirmPassword",
                  e.target.value,
                  e.target.form || undefined
                )
              }
              onChange={(e) =>
                handleChange(
                  "confirmPassword",
                  e.target.value,
                  e.target.form || undefined
                )
              }
              className={`peer w-full rounded-lg border bg-white/5 px-3 py-1.5 sm:px-4 sm:py-3 pr-10 sm:pr-12 text-xs sm:text-sm text-white outline-none transition-all focus:bg-white/10 focus:ring-1 ${
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-white/10 focus:border-[rgb(18,135,173)] focus:ring-[rgb(18,135,173)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 sm:right-3 top-1.5 sm:top-[14px] text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
            <label
              htmlFor="confirmPassword"
              className={`pointer-events-none absolute left-3 sm:left-4 top-1.5 sm:top-3 text-xs sm:text-sm transition-all peer-focus:-top-2 sm:peer-focus:-top-2.5 peer-focus:bg-[#1a1d21]/90 peer-focus:backdrop-blur-md peer-focus:px-1 peer-focus:text-[10px] sm:peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 sm:peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21]/90 peer-[:not(:placeholder-shown)]:backdrop-blur-md peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-[10px] sm:peer-[:not(:placeholder-shown)]:text-xs ${
                errors.confirmPassword && touched.confirmPassword
                  ? "text-red-500 peer-focus:text-red-500"
                  : "text-gray-400 peer-focus:text-[rgb(18,135,173)]"
              }`}
            >
              Confirm Password
            </label>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[rgb(18,135,173)]! hover:bg-[rgb(15,115,148)]! hover:shadow-[0_0_20px_rgba(18,135,173,0.3)] border-none"
            fullWidth
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-3 sm:mt-8 text-center text-[10px] sm:text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/user/signin"
            className="font-semibold text-[rgb(18,135,173)] hover:text-[rgb(22,160,205)] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
