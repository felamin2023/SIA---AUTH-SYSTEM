"use client";

import React, { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/../firebaseconfig";

interface LoginRequest {
  sessionId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface LoginConfirmModalProps {
  isOpen: boolean;
  loginRequest: LoginRequest | null;
  onClose: () => void;
}

export default function LoginConfirmModal({
  isOpen,
  loginRequest,
  onClose,
}: LoginConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!loginRequest || !auth.currentUser) return;
    setIsProcessing(true);

    try {
      // Get user's MFA status
      const userDoc = await getDoc(doc(db, "user", auth.currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Update the login request with approval and user data
      await updateDoc(doc(db, "loginRequests", loginRequest.sessionId), {
        status: "approved",
        approvedByUid: auth.currentUser.uid,
        approvedByEmail: auth.currentUser.email,
        mfaEnabled: userData.mfaEnabled || false,
        mfaSecret: userData.mfaSecret || null,
        approvedAt: new Date().toISOString(),
      });

      onClose();
    } catch (err) {
      console.error("Error approving login:", err);
    }

    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!loginRequest) return;
    setIsProcessing(true);

    try {
      await updateDoc(doc(db, "loginRequests", loginRequest.sessionId), {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      });

      onClose();
    } catch (err) {
      console.error("Error rejecting login:", err);
    }

    setIsProcessing(false);
  };

  if (!isOpen || !loginRequest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-4 animate-[slideDown_0.3s_ease-out]">
        <div className="rounded-2xl border border-white/10 bg-[#1a1d21] p-6 shadow-2xl">
          {/* Warning Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-yellow-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-center text-xl font-bold text-white">
            Login Request
          </h2>

          {/* Description */}
          <p className="mb-6 text-center text-sm text-gray-400">
            Someone is trying to sign in to your account from another device. Do you want to approve this login?
          </p>

          {/* Device Info */}
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(18,135,173)]/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 text-[rgb(18,135,173)]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">New Device Login</p>
                <p className="text-xs text-gray-400">
                  Requested at {new Date(loginRequest.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-center text-xs text-red-400">
              ⚠️ Only approve if you recognize this login attempt. If you didn&apos;t request this, tap Reject.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 rounded-lg border border-red-500/50 bg-red-500/10 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              {isProcessing ? "..." : "Reject"}
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 rounded-lg bg-[rgb(18,135,173)] py-3 text-sm font-medium text-white transition-colors hover:bg-[rgb(22,160,205)] disabled:opacity-50"
            >
              {isProcessing ? "Approving..." : "Approve Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
