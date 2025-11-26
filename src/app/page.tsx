import Link from "next/link";
import React from "react";
import LinearParticles from "@/app/frontend/components/animations/LinearParticles";
import HangingButton from "@/app/frontend/components/animations/HangingButton";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <LinearParticles />
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-[rgb(18,135,173)]/20 blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-[rgb(18,135,173)]/10 blur-[100px]" />
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-between">
        {/* Left Side - Welcome Text */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:max-w-lg lg:pt-16">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(18,135,173)]/20 text-[rgb(18,135,173)]">
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
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>

          <h1 className="text-5xl font-bold text-white lg:text-6xl">SIA</h1>
          <h2 className="mt-2 text-2xl font-semibold text-[rgb(18,135,173)] lg:text-3xl">
            Auth System
          </h2>

          <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-md">
            Welcome to the Secure Identity Authentication System. Experience
            seamless and protected access to your account with our
            state-of-the-art security features. Your privacy and data protection
            are our top priorities.
          </p>

          <div className="mt-8 text-sm text-gray-500">
            By continuing, you agree to our{" "}
            <Link
              href="#"
              className="font-semibold text-[rgb(18,135,173)] hover:text-[rgb(22,160,205)] hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="font-semibold text-[rgb(18,135,173)] hover:text-[rgb(22,160,205)] hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Right Side - Hanging Buttons */}
        <div className="relative flex items-start justify-center gap-16 pt-4">
          {/* Ceiling bar */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[320px] h-3 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-full shadow-lg" />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[300px] h-1 bg-zinc-500 rounded-full opacity-50" />

          <HangingButton href="/user/signin" variant="primary" ropeLength={100}>
            Sign In
          </HangingButton>

          <HangingButton
            href="/user/signup"
            variant="secondary"
            ropeLength={100}
          >
            Create Account
          </HangingButton>
        </div>
      </div>
    </div>
  );
}
