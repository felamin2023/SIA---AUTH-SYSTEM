"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function EmailConfirmationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      {/* Glass Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          {/* Email Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(18,135,173)]/20 text-[rgb(18,135,173)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Email Confirmation Required
          </h1>
        </div>

        <div className="mb-8 text-center">
          <p className="text-gray-300 leading-relaxed">
            We sent the email to{" "}
            <span className="font-semibold text-[rgb(18,135,173)]">{email}</span>.
            Check your inbox to activate the account. If the confirmation email
            is not in your inbox, please check the{" "}
            <span className="font-semibold text-yellow-400">Spam</span>. Thank you.
          </p>
        </div>

        {/* Go to Sign In Button */}
        <div className="flex flex-col gap-4">
          <Link
            href="/frontend/pages/user/signin"
            className="w-full rounded-lg bg-[rgb(18,135,173)] py-3 text-center font-medium text-white transition-all hover:bg-[rgb(15,115,148)] hover:shadow-[0_0_20px_rgba(18,135,173,0.3)]"
          >
            Go to Sign In
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Wrong email?{" "}
          <Link
            href="/frontend/pages/user/signup"
            className="font-semibold text-[rgb(18,135,173)] hover:text-[rgb(22,160,205)] hover:underline"
          >
            Sign up again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EmailConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center p-4">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <EmailConfirmationContent />
    </Suspense>
  );
}
