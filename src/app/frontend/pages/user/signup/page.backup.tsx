"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ParticleAnimation from "@/app/frontend/components/animations/ParticleAnimation";
import Button from "@/app/frontend/components/ui/Button";

/**
 * SignUpPage component
 * - Clean, modern white aesthetics.
 * - Floating label inputs.
 * - Particle animation on the right.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

    console.log("Sign up data:", Object.fromEntries(data.entries()));

    // Set cookie
    document.cookie = "isAuthenticated=true; path=/; max-age=86400";
    router.push("/frontend/pages/user/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-linear-to-br from-gray-50 to-white">
      {/* Form Section - Left */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 py-12 md:py-0 z-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-300/40">
          {/* Header Section */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Create account
            </h1>
            <p className="text-base text-gray-500">
              Enter your details to get started
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Email Input with Floating Label */}
            <div className="relative group">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                onBlur={(e) => handleBlur("email", e.target.value)}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`peer w-full border rounded-lg bg-transparent px-4 pt-5 pb-3 text-gray-900 focus:outline-none transition-all duration-300 ease-out placeholder:text-transparent focus:placeholder:text-gray-400 ${
                  errors.email && touched.email
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 group-hover:border-gray-400"
                }`}
              />
              <label
                htmlFor="email"
                className={`absolute left-3 px-1 bg-white transition-all duration-300 ease-out pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-white font-medium ${
                  errors.email && touched.email
                    ? "-top-2.5 text-xs text-red-500 peer-focus:text-red-500 bg-white"
                    : "-top-2.5 text-xs text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-500"
                }`}
              >
                Email
              </label>
              {errors.email && touched.email && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 animate-pulse">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input with Floating Label */}
            <div className="relative group">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                onBlur={(e) => handleBlur("password", e.target.value)}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`peer w-full border rounded-lg bg-transparent px-4 pt-5 pb-3 text-gray-900 focus:outline-none transition-all duration-300 ease-out placeholder:text-transparent focus:placeholder:text-gray-400 ${
                  errors.password && touched.password
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 group-hover:border-gray-400"
                }`}
              />
              <label
                htmlFor="password"
                className={`absolute left-3 px-1 bg-white transition-all duration-300 ease-out pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-white font-medium ${
                  errors.password && touched.password
                    ? "-top-2.5 text-xs text-red-500 peer-focus:text-red-500 bg-white"
                    : "-top-2.5 text-xs text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-500"
                }`}
              >
                Password
              </label>
              {errors.password && touched.password && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 animate-pulse">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input with Floating Label */}
            <div className="relative group">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
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
                className={`peer w-full border rounded-lg bg-transparent px-4 pt-5 pb-3 text-gray-900 focus:outline-none transition-all duration-300 ease-out placeholder:text-transparent focus:placeholder:text-gray-400 ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 group-hover:border-gray-400"
                }`}
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-3 px-1 bg-white transition-all duration-300 ease-out pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-white font-medium ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "-top-2.5 text-xs text-red-500 peer-focus:text-red-500 bg-white"
                    : "-top-2.5 text-xs text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-500"
                }`}
              >
                Confirm Password
              </label>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 animate-pulse">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Sign Up Button */}
            <div className="pt-6">
              <Button type="submit" variant="primary" fullWidth>
                Create Account
              </Button>
            </div>
          </form>

          {/* Footer Section */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/user/signin"
                className="font-semibold text-blue-500 hover:text-blue-600 transition-colors duration-300 hover:underline underline-offset-2 cursor-pointer"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Particle Animation Section - Right */}
      <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden border-l border-gray-100/50 bg-linear-to-br from-gray-50 via-white to-blue-50/30">
        <ParticleAnimation />
      </div>
    </div>
  );
}
