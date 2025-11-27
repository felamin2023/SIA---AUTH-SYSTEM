"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/../firebaseconfig";
import Button from "@/app/frontend/components/ui/Button";
import MFAVerifyModal from "@/app/frontend/components/MFAVerifyModal";
import QRLoginModal from "@/app/frontend/components/QRLoginModal";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationToast, setShowVerificationToast] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [pendingUserUid, setPendingUserUid] = useState<string>("");
  const [showQRLoginModal, setShowQRLoginModal] = useState(false);
  const [qrLoginMFAData, setQrLoginMFAData] = useState<{
    mfaEnabled: boolean;
    mfaSecret: string | null;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setShowVerificationToast(false);
    setErrorToast(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setShowVerificationToast(true);
        // Auto-hide toast after 5 seconds
        setTimeout(() => setShowVerificationToast(false), 5000);
        // Sign out the user since they're not verified
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      // Check if user has MFA enabled
      const userDoc = await getDoc(doc(db, "user", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.mfaEnabled) {
          // Show MFA verification modal
          setPendingUserUid(user.uid);
          setShowMFAModal(true);
          setIsLoading(false);
          return;
        }
      }

      console.log("User signed in successfully:", user.email);

      // Set cookie for middleware
      document.cookie = "isAuthenticated=true; path=/; max-age=86400"; // Expires in 1 day

      router.push("/frontend/pages/user/dashboard");
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };

      let errorMessage = "An error occurred during sign in";

      switch (firebaseError.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Invalid email or password";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        default:
          errorMessage =
            firebaseError.message || "An error occurred during sign in";
      }

      setErrorToast(errorMessage);
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }

  function handleMFASuccess() {
    // MFA verification successful, proceed to dashboard
    document.cookie = "isAuthenticated=true; path=/; max-age=86400";
    setShowMFAModal(false);
    router.push("/frontend/pages/user/dashboard");
  }

  function handleMFAClose() {
    setShowMFAModal(false);
    setPendingUserUid("");
  }

  // QR Login handlers
  function handleQRLoginApproved(
    userId: string,
    mfaEnabled: boolean,
    mfaSecret: string | null
  ) {
    setShowQRLoginModal(false);

    if (mfaEnabled) {
      // Store MFA data and show MFA verification
      setQrLoginMFAData({ mfaEnabled, mfaSecret });
      setPendingUserUid(userId);
      setShowMFAModal(true);
    } else {
      // No MFA, proceed directly to dashboard
      // Store user ID for QR login sessions (since Firebase Auth isn't used)
      localStorage.setItem("qrLoginUserId", userId);
      document.cookie = "isAuthenticated=true; path=/; max-age=86400";
      router.push("/frontend/pages/user/dashboard");
    }
  }

  function handleQRLoginMFASuccess() {
    // MFA verification successful for QR login
    // Store user ID for QR login sessions
    localStorage.setItem("qrLoginUserId", pendingUserUid);
    document.cookie = "isAuthenticated=true; path=/; max-age=86400";
    setShowMFAModal(false);
    setQrLoginMFAData(null);
    router.push("/frontend/pages/user/dashboard");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-10 sm:p-4">
      {/* Fixed Toast Notifications */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        {/* Email Not Verified Toast */}
        {showVerificationToast && (
          <div className="animate-[slideDown_0.3s_ease-out] rounded-lg border border-yellow-500/50 bg-yellow-500/90 px-3 py-2 sm:px-4 sm:py-3 text-center text-xs sm:text-sm font-medium text-white shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <span>Please verify your email before signing in</span>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {errorToast && (
          <div className="animate-[slideDown_0.3s_ease-out] rounded-lg border border-red-500/50 bg-red-500/90 px-3 py-2 sm:px-4 sm:py-3 text-center text-xs sm:text-sm font-medium text-white shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span>{errorToast}</span>
            </div>
          </div>
        )}
      </div>

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
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Welcome Back
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-400">
            Please sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-5">
          {/* Use QR Code Button */}
          <button
            type="button"
            onClick={() => setShowQRLoginModal(true)}
            className="flex w-full items-center justify-center gap-2 sm:gap-3 rounded-lg border border-white/10 bg-white/5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
          >
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
                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
              />
            </svg>
            Use QR code
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs sm:text-sm text-gray-400">or</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <div className="group relative">
            <input
              name="email"
              type="email"
              required
              placeholder=" "
              className="peer w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-white outline-none transition-all focus:border-[rgb(18,135,173)] focus:bg-white/10 focus:ring-1 focus:ring-[rgb(18,135,173)]"
            />
            <label className="pointer-events-none absolute left-3 sm:left-4 top-1.5 sm:top-2 text-xs sm:text-sm text-gray-400 transition-all peer-focus:-top-2 sm:peer-focus:-top-2.5 peer-focus:bg-[#1a1d21]/90 peer-focus:backdrop-blur-md peer-focus:px-1 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-[rgb(18,135,173)] peer-[:not(:placeholder-shown)]:-top-2 sm:peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21]/90 peer-[:not(:placeholder-shown)]:backdrop-blur-md peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-[10px] sm:peer-[:not(:placeholder-shown)]:text-xs">
              Email address
            </label>
          </div>

          <div className="group relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder=" "
              className="peer w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 pr-10 sm:pr-12 text-xs sm:text-sm text-white outline-none transition-all focus:border-[rgb(18,135,173)] focus:bg-white/10 focus:ring-1 focus:ring-[rgb(18,135,173)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 sm:right-3 top-1.5 sm:top-2.5 text-gray-400 hover:text-white transition-colors"
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
            <label className="pointer-events-none absolute left-3 sm:left-4 top-1.5 sm:top-2 text-xs sm:text-sm text-gray-400 transition-all peer-focus:-top-2 sm:peer-focus:-top-2.5 peer-focus:bg-[#1a1d21]/90 peer-focus:backdrop-blur-md peer-focus:px-1 peer-focus:text-[10px] sm:peer-focus:text-xs peer-focus:text-[rgb(18,135,173)] peer-[:not(:placeholder-shown)]:-top-2 sm:peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#1a1d21]/90 peer-[:not(:placeholder-shown)]:backdrop-blur-md peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-[10px] sm:peer-[:not(:placeholder-shown)]:text-xs">
              Password
            </label>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center gap-1.5 sm:gap-2 text-gray-400 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-white/20 bg-white/5 text-[rgb(18,135,173)] focus:ring-[rgb(18,135,173)] focus:ring-offset-0"
              />
              Remember me
            </label>
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
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-3 sm:mt-5 text-center text-[10px] sm:text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/user/signup"
            className="font-semibold text-[rgb(18,135,173)] hover:text-[rgb(22,160,205)] hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>

      {/* MFA Verification Modal */}
      <MFAVerifyModal
        isOpen={showMFAModal}
        onClose={handleMFAClose}
        onSuccess={qrLoginMFAData ? handleQRLoginMFASuccess : handleMFASuccess}
        userUid={pendingUserUid}
        mfaSecret={qrLoginMFAData?.mfaSecret}
      />

      {/* QR Login Modal */}
      <QRLoginModal
        isOpen={showQRLoginModal}
        onClose={() => setShowQRLoginModal(false)}
        onLoginApproved={handleQRLoginApproved}
      />
    </div>
  );
}
