
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function SignInPage() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Simulate authentication
    console.log("Sign in data:", Object.fromEntries(data.entries()));

    // Set cookie for middleware
    document.cookie = "isAuthenticated=true; path=/; max-age=86400"; // Expires in 1 day

    router.push("/user/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <main className="w-full max-w-md rounded-md bg-zinc-900 p-8 shadow-md border border-zinc-800">
        <h2 className="mb-4 text-2xl font-semibold text-white">Sign In</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-zinc-300">Email</span>
            <input
              name="email"
              type="email"
              required
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-white focus:outline-none"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-1 text-zinc-300">Password</span>
            <input
              name="password"
              type="password"
              required
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-white focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded bg-white px-4 py-2 text-black font-medium hover:bg-zinc-200"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link
            href="/user/signup"
            className="font-medium text-white hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </main>
    </div>
  );
}
