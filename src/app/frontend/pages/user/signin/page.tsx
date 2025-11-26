"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Button from "@/app/frontend/components/ui/Button";
import LinearParticles from "@/app/frontend/components/animations/LinearParticles";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate authentication
    console.log("Sign in data:", Object.fromEntries(data.entries()));

    // Set cookie for middleware
    document.cookie = "isAuthenticated=true; path=/; max-age=86400"; // Expires in 1 day

    router.push("/user/dashboard");
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <LinearParticles />
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-[rgb(18,135,173)]/20 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-[rgb(18,135,173)]/10 blur-[100px]" />
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
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
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-400">
            Please sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="group relative">
            <input
              name="email"
              type="email"
              required
              placeholder=" "
              className="peer w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-[rgb(18,135,173)] focus:bg-white/10 focus:ring-1 focus:ring-[rgb(18,135,173)]"
            />
            <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:bg-[#1a1d21] peer-focus:px-1 peer-focus:text-xs peer-focus:text-[rgb(18,135,173)] peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21] peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs">
              Email address
            </label>
          </div>

          <div className="group relative">
            <input
              name="password"
              type="password"
              required
              placeholder=" "
              className="peer w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-[rgb(18,135,173)] focus:bg-white/10 focus:ring-1 focus:ring-[rgb(18,135,173)]"
            />
            <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:bg-[#1a1d21] peer-focus:px-1 peer-focus:text-xs peer-focus:text-[rgb(18,135,173)] peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21] peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs">
              Password
            </label>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-[rgb(18,135,173)] focus:ring-[rgb(18,135,173)] focus:ring-offset-0"
              />
              Remember me
            </label>
            <a
              href="#"
              className="font-medium text-[rgb(18,135,173)] hover:text-[rgb(22,160,205)] hover:underline"
            >
              Forgot password?
            </a>
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
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/user/signup"
            className="font-semibold text-[rgb(18,135,173)] hover:text-[rgb(22,160,205)] hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
