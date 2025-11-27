"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "@/../firebaseconfig";

interface QRLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginApproved: (userId: string, mfaEnabled: boolean, mfaSecret: string | null) => void;
}

export default function QRLoginModal({
  isOpen,
  onClose,
  onLoginApproved,
}: QRLoginModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [status, setStatus] = useState<"waiting" | "approved" | "rejected">("waiting");
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const sessionIdRef = useRef<string>("");
  const onLoginApprovedRef = useRef(onLoginApproved);

  // Keep onLoginApproved ref updated
  useEffect(() => {
    onLoginApprovedRef.current = onLoginApproved;
  }, [onLoginApproved]);

  // Generate unique session ID and QR code
  useEffect(() => {
    if (!isOpen) return;

    const generateSession = async () => {
      // Generate unique session ID
      const newSessionId = `qr_login_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionIdRef.current = newSessionId;
      setStatus("waiting");

      // Create login request in Firestore
      await setDoc(doc(db, "loginRequests", newSessionId), {
        sessionId: newSessionId,
        status: "pending",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes expiry
      });

      // Generate QR code with session ID
      const qrData = JSON.stringify({
        type: "qr_login",
        sessionId: newSessionId,
      });

      try {
        const qrUrl = await QRCode.toDataURL(qrData, {
          width: 250,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
        setQrCodeUrl(qrUrl);
      } catch (err) {
        console.error("Error generating QR code:", err);
      }

      // Listen for approval/rejection
      const unsubscribe = onSnapshot(doc(db, "loginRequests", newSessionId), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.status === "approved") {
            setStatus("approved");
            // Pass user data to parent using ref to avoid stale closure
            onLoginApprovedRef.current(data.approvedByUid, data.mfaEnabled || false, data.mfaSecret || null);
            // Clean up the request
            deleteDoc(doc(db, "loginRequests", newSessionId));
          } else if (data.status === "rejected") {
            setStatus("rejected");
            // Clean up the request
            deleteDoc(doc(db, "loginRequests", newSessionId));
          }
        }
      });

      unsubscribeRef.current = unsubscribe;
    };

    generateSession();

    // Cleanup on unmount or close
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (sessionIdRef.current) {
        deleteDoc(doc(db, "loginRequests", sessionIdRef.current)).catch(console.error);
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    if (sessionIdRef.current) {
      deleteDoc(doc(db, "loginRequests", sessionIdRef.current)).catch(console.error);
    }
    setQrCodeUrl("");
    sessionIdRef.current = "";
    setStatus("waiting");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md mx-4 animate-[slideDown_0.3s_ease-out]">
        <div className="rounded-2xl border border-white/10 bg-[#1a1d21] p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Sign in with QR Code</h2>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {status === "waiting" && (
            <>
              {/* Instructions */}
              <p className="mb-4 text-center text-sm text-gray-400">
                Scan this QR code with your mobile device where you&apos;re already logged in to approve the login.
              </p>

              {/* QR Code */}
              <div className="mb-4 flex justify-center">
                <div className="rounded-xl bg-white p-3">
                  {qrCodeUrl ? (
                    <Image src={qrCodeUrl} alt="QR Code for login" width={250} height={250} className="h-[250px] w-[250px]" />
                  ) : (
                    <div className="flex h-[250px] w-[250px] items-center justify-center">
                      <svg className="h-8 w-8 animate-spin text-gray-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Waiting for approval...</span>
              </div>

              {/* Timer note */}
              <p className="mt-4 text-center text-xs text-gray-500">
                This QR code expires in 5 minutes
              </p>
            </>
          )}

          {status === "rejected" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8 text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Login Rejected</h3>
              <p className="mb-4 text-sm text-gray-400">The login request was rejected from your other device.</p>
              <button
                onClick={handleClose}
                className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
