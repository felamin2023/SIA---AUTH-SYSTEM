import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-6 sm:items-start">
        <h1 className="text-4xl font-bold text-white">
          Welcome to SIA Auth System
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl text-center">
          A simple starter for authentication flows. Sign in or create an
          account to continue.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
          <Link
            href="/user/signin"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-black hover:bg-zinc-200"
          >
            Sign In
          </Link>

          <Link
            href="/user/signup"
            className="inline-flex items-center justify-center rounded-full border border-white px-6 py-3 text-white hover:bg-white/10"
          >
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}
