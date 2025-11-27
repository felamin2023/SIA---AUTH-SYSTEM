"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/../firebaseconfig";
import QRScannerModal from "@/app/frontend/components/QRScannerModal";
import MFASetupModal from "@/app/frontend/components/MFASetupModal";
import LoginConfirmModal from "@/app/frontend/components/LoginConfirmModal";

interface LoginRequest {
  sessionId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isMFASetupOpen, setIsMFASetupOpen] = useState(false);
  const [isLoadingMFA, setIsLoadingMFA] = useState(true);
  const [pendingLoginRequest, setPendingLoginRequest] = useState<LoginRequest | null>(null);
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch MFA status from Firestore when auth state is ready or from QR login
  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      try {
        const userDocRef = doc(db, "user", userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const mfaStatus = userData.mfaEnabled === true;
          setMfaEnabled(mfaStatus);
        }
      } catch (err) {
        console.error("Error fetching MFA status:", err);
      }
      setIsLoadingMFA(false);
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Regular Firebase Auth login
        setCurrentUserId(user.uid);
        // Clear any QR login data since we have a real auth session
        localStorage.removeItem("qrLoginUserId");
        await fetchUserData(user.uid);
      } else {
        // Check for QR login session
        const qrLoginUserId = localStorage.getItem("qrLoginUserId");
        if (qrLoginUserId) {
          setCurrentUserId(qrLoginUserId);
          await fetchUserData(qrLoginUserId);
        } else {
          setIsLoadingMFA(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle scanned QR code result - check for login requests
  const handleQRScanResult = async (result: string) => {
    try {
      const data = JSON.parse(result);
      if (data.type === "qr_login" && data.sessionId) {
        // Check if the login request exists and is pending
        const requestDoc = await getDoc(doc(db, "loginRequests", data.sessionId));
        if (requestDoc.exists()) {
          const requestData = requestDoc.data();
          if (requestData.status === "pending") {
            // Check if not expired
            if (new Date(requestData.expiresAt) > new Date()) {
              setPendingLoginRequest({
                sessionId: data.sessionId,
                status: requestData.status,
                createdAt: requestData.createdAt,
                expiresAt: requestData.expiresAt,
              });
              setIsQRScannerOpen(false);
              setShowLoginConfirm(true);
            } else {
              // Request expired, delete it
              await deleteDoc(doc(db, "loginRequests", data.sessionId));
              console.log("Login request expired");
            }
          }
        }
      }
    } catch (err) {
      console.error("Invalid QR code data:", err);
    }
  };

  const handleLoginConfirmClose = () => {
    setShowLoginConfirm(false);
    setPendingLoginRequest(null);
  };

  async function handleDisableMFA() {
    // Use Firebase Auth user or QR login user ID
    const userId = auth.currentUser?.uid || currentUserId;
    if (userId) {
      try {
        await updateDoc(doc(db, "user", userId), {
          mfaEnabled: false,
          mfaSecret: null,
        });
        setMfaEnabled(false);
        console.log("MFA disabled");
      } catch (err) {
        console.error("Error disabling MFA:", err);
      }
    }
  }

  function handleLogout() {
    auth.signOut();
    // Clear QR login session data
    localStorage.removeItem("qrLoginUserId");
    document.cookie =
      "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/user/signin");
  }

  return (
    <div className="min-h-screen">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-white">Dashboard</h1>

          <div className="flex items-center gap-4">
            {/* Profile Section */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="hidden text-sm font-medium text-white sm:block">
                John Doe
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Authentication Settings</h2>
          <p className="mt-1 text-zinc-400">Manage your authentication methods and security preferences.</p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Authentication Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <svg
                className="h-6 w-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">QR Authentication</h3>
            <p className="mb-6 text-sm text-zinc-400">
              Scan the QR code with your authenticator app to enable quick and secure login.
            </p>
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[rgb(18,135,173)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgb(22,160,205)] focus:outline-none focus:ring-2 focus:ring-[rgb(18,135,173)] focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Scan Me
            </button>
          </div>

          {/* MFA Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <svg
                className="h-6 w-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Multi-Factor Authentication</h3>
            <p className="mb-6 text-sm text-zinc-400">
              Add an extra layer of security by requiring a second form of verification.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">
                {isLoadingMFA ? "Loading..." : mfaEnabled ? "Enabled" : "Disabled"}
              </span>
              {/* Toggle Switch */}
              <button
                disabled={isLoadingMFA}
                onClick={() => {
                  if (!mfaEnabled) {
                    // Open MFA setup modal when enabling
                    setIsMFASetupOpen(true);
                  } else {
                    // Disable MFA and remove from Firestore
                    handleDisableMFA();
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(18,135,173)] focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 ${mfaEnabled ? "bg-[rgb(18,135,173)]" : "bg-white/20"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mfaEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScanResult}
      />

      {/* MFA Setup Modal */}
      <MFASetupModal
        isOpen={isMFASetupOpen}
        onClose={() => setIsMFASetupOpen(false)}
        onConfirm={() => {
          setMfaEnabled(true);
          setIsMFASetupOpen(false);
        }}
      />

      {/* Login Confirm Modal */}
      <LoginConfirmModal
        isOpen={showLoginConfirm}
        loginRequest={pendingLoginRequest}
        onClose={handleLoginConfirmClose}
      />
    </div>
  );
}
