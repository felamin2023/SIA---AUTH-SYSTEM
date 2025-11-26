"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

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
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      {/* Form Section - Left */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 py-12 md:py-0 z-10 bg-black">
        <div className="w-full max-w-sm">
          {/* Header Section */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white-900 mb-3 tracking-tight">
              Create account
            </h1>
            <p className="text-base text-gray-500">
              Enter your details to get started
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Input with Floating Label */}
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                onBlur={(e) => handleBlur("email", e.target.value)}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`peer w-full border-b-2 bg-transparent px-0 pt-5 pb-2 text-gray-900 focus:outline-none transition-colors duration-300 placeholder:text-transparent focus:placeholder:text-gray-400 ${
                  errors.email && touched.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-600"
                }`}
              />
              <label
                htmlFor="email"
                className={`absolute left-0 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs font-medium ${
                  errors.email && touched.email
                    ? "top-0 text-xs text-red-500 peer-focus:text-red-500"
                    : "top-0 text-xs text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-600"
                }`}
              >
                Email
              </label>
              {errors.email && touched.email && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
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
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                onBlur={(e) => handleBlur("password", e.target.value)}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`peer w-full border-b-2 bg-transparent px-0 pt-5 pb-2 text-gray-900 focus:outline-none transition-colors duration-300 placeholder:text-transparent focus:placeholder:text-gray-400 ${
                  errors.password && touched.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-600"
                }`}
              />
              <label
                htmlFor="password"
                className={`absolute left-0 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs font-medium ${
                  errors.password && touched.password
                    ? "top-0 text-xs text-red-500 peer-focus:text-red-500"
                    : "top-0 text-xs text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-600"
                }`}
              >
                Password
              </label>
              {errors.password && touched.password && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
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
            <div className="relative">
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
                className={`peer w-full border-b-2 bg-transparent px-0 pt-5 pb-2 text-gray-900 focus:outline-none transition-colors duration-300 placeholder:text-transparent focus:placeholder:text-gray-400 ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-600"
                }`}
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-0 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs font-medium ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "top-0 text-xs text-red-500 peer-focus:text-red-500"
                    : "top-0 text-xs text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-blue-600"
                }`}
              >
                Confirm Password
              </label>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
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
            <div className="pt-4">Create Account</div>
          </form>

          {/* Footer Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/user/signin"
                className="font-semibold text-blue-600 hover:underline hover:text-blue-700"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
