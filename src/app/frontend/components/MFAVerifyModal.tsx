"use client";

import React, { useState, useEffect, useRef } from "react";
import * as OTPAuth from "otpauth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/../firebaseconfig";

interface MFAVerifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userUid: string;
    mfaSecret?: string | null;  // Optional: pass directly for QR login flow
}

export default function MFAVerifyModal({
    isOpen,
    onClose,
    onSuccess,
    userUid,
    mfaSecret: providedMfaSecret,
}: MFAVerifyModalProps) {
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [fetchedMfaSecret, setFetchedMfaSecret] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const hasInitialized = useRef(false);

    // Use provided secret or fetched secret
    const mfaSecret = providedMfaSecret || fetchedMfaSecret;
    
    // Loading is true only when we need to fetch and are currently fetching
    const isLoading = !providedMfaSecret && isFetching;

    // Fetch MFA secret from Firestore (only if not provided directly)
    useEffect(() => {
        // If mfaSecret is provided directly (QR login flow), don't fetch
        if (!isOpen || providedMfaSecret || hasInitialized.current || !userUid) return;

        const fetchMfaSecret = async () => {
            hasInitialized.current = true;
            setIsFetching(true);

            try {
                const userDoc = await getDoc(doc(db, "user", userUid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.mfaSecret) {
                        setFetchedMfaSecret(userData.mfaSecret);
                    }
                }
            } catch (err) {
                console.error("Error fetching MFA secret:", err);
                setError("Failed to load MFA settings");
            }

            setIsFetching(false);
        };

        fetchMfaSecret();
    }, [isOpen, userUid, providedMfaSecret]);

    const handleVerify = () => {
        if (!mfaSecret) return;
        setIsVerifying(true);
        setError("");

        // Recreate TOTP instance with stored secret
        const totp = new OTPAuth.TOTP({
            issuer: "SIA",
            label: "user",
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(mfaSecret),
        });

        const delta = totp.validate({ token: verificationCode, window: 1 });

        if (delta !== null) {
            onSuccess();
        } else {
            setError("Invalid verification code. Please try again.");
        }
        setIsVerifying(false);
    };

    const handleClose = () => {
        setVerificationCode("");
        setError("");
        setFetchedMfaSecret(null);
        setIsFetching(false);
        hasInitialized.current = false;
        // Only sign out if there's currently a signed-in user (regular MFA flow)
        // In QR login flow, the user isn't signed in yet
        if (auth.currentUser) {
            auth.signOut();
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 w-full max-w-md mx-4 animate-[slideDown_0.3s_ease-out]">
                <div className="rounded-2xl border border-white/10 bg-[#1a1d21] p-6 shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
                        <button onClick={handleClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Shield Icon */}
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(18,135,173)]/20">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-8 w-8 text-[rgb(18,135,173)]"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                />
                            </svg>
                        </div>
                    </div>

                    <p className="mb-6 text-center text-sm text-gray-400">
                        Enter the 6-digit code from your authenticator app to continue signing in.
                    </p>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <svg className="h-8 w-8 animate-spin text-[rgb(18,135,173)]" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                        setVerificationCode(value);
                                        setError("");
                                    }}
                                    placeholder="000000"
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white outline-none transition-all focus:border-[rgb(18,135,173)] focus:bg-white/10 focus:ring-1 focus:ring-[rgb(18,135,173)]"
                                    maxLength={6}
                                    autoFocus
                                />
                                {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVerify}
                                    disabled={verificationCode.length !== 6 || isVerifying || !mfaSecret}
                                    className="flex-1 rounded-lg bg-[rgb(18,135,173)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgb(22,160,205)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isVerifying ? "Verifying..." : "Verify"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
