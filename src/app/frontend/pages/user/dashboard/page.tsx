"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function DashboardPage() {
  const router = useRouter();

  function handleLogout() {
    // Clear the cookie
    document.cookie =
      "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/user/signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="w-full max-w-3xl rounded-md bg-zinc-900 p-8 shadow-md border border-zinc-800">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>

        <section className="mt-6 text-zinc-300">
          <p>Welcome to your dashboard. You are now logged in.</p>
        </section>
      </main>
    </div>
  );
}
