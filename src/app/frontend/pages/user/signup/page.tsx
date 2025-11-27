"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/../firebaseconfig";
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
    if (password.length < 6) {
      return "Password must be at least 6 characters";
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
    if (touched[field]) {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully:", userCredential.user.email);

      // Send email verification
      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent to:", email);

      // Redirect to email confirmation page with email as query parameter
      router.push(`/frontend/pages/user/emailconfirmation?email=${encodeURIComponent(email)}`);
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
          errorMessage = firebaseError.message || "An error occurred during sign up";
      }

      setErrors((prev) => ({ ...prev, firebase: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      {/* Glass Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(18,135,173)]/20 text-[rgb(18,135,173)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your details to get started
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          noValidate
        >
          {/* Firebase Error Display */}
          {errors.firebase && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-center text-sm text-red-500">
              {errors.firebase}
            </div>
          )}

          {/* Email Input */}
          <div className="group relative">
            {/* Email Exists Toast Notification */}
            {emailExistsToast && (
              <div className="absolute -top-12 left-0 right-0 z-10 animate-[slideDown_0.3s_ease-out] rounded-lg border border-red-500/50 bg-red-500/90 px-4 py-2 text-center text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
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
              className={`peer w-full rounded-lg border bg-white/5 px-4 py-3 text-white outline-none transition-all focus:bg-white/10 focus:ring-1 ${errors.email && touched.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-white/10 focus:border-[rgb(18,135,173)] focus:ring-[rgb(18,135,173)]"
                }`}
            />
            <label
              htmlFor="email"
              className={`pointer-events-none absolute left-4 top-3 transition-all peer-focus:-top-2.5 peer-focus:bg-[#1a1d21]/90 peer-focus:backdrop-blur-md peer-focus:px-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21]/90 peer-[:not(:placeholder-shown)]:backdrop-blur-md peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs ${errors.email && touched.email
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
              type="password"
              required
              placeholder=" "
              onBlur={(e) => handleBlur("password", e.target.value)}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`peer w-full rounded-lg border bg-white/5 px-4 py-3 text-white outline-none transition-all focus:bg-white/10 focus:ring-1 ${errors.password && touched.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-white/10 focus:border-[rgb(18,135,173)] focus:ring-[rgb(18,135,173)]"
                }`}
            />
            <label
              htmlFor="password"
              className={`pointer-events-none absolute left-4 top-3 transition-all peer-focus:-top-2.5 peer-focus:bg-[#1a1d21]/90 peer-focus:backdrop-blur-md peer-focus:px-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21]/90 peer-[:not(:placeholder-shown)]:backdrop-blur-md peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs ${errors.password && touched.password
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
              type="password"
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
              className={`peer w-full rounded-lg border bg-white/5 px-4 py-3 text-white outline-none transition-all focus:bg-white/10 focus:ring-1 ${errors.confirmPassword && touched.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-white/10 focus:border-[rgb(18,135,173)] focus:ring-[rgb(18,135,173)]"
                }`}
            />
            <label
              htmlFor="confirmPassword"
              className={`pointer-events-none absolute left-4 top-3 transition-all peer-focus:-top-2.5 peer-focus:bg-[#1a1d21]/90 peer-focus:backdrop-blur-md peer-focus:px-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21]/90 peer-[:not(:placeholder-shown)]:backdrop-blur-md peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs ${errors.confirmPassword && touched.confirmPassword
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
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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

        <div className="mt-8 text-center text-sm text-gray-400">
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
