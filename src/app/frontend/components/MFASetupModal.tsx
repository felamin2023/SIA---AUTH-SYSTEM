"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/../firebaseconfig";

interface MFASetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

interface TOTPData {
    totp: OTPAuth.TOTP;
    secretKey: string;
    qrCodeUrl: string;
}

export default function MFASetupModal({
    isOpen,
    onClose,
    onConfirm,
}: MFASetupModalProps) {
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [totpData, setTotpData] = useState<TOTPData | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const hasInitialized = useRef(false);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Fetch user email from Firestore and generate TOTP
    useEffect(() => {
        if (!isOpen || hasInitialized.current || !currentUser) return;

        const initializeMFA = async () => {
            hasInitialized.current = true;

            let email = "user@example.com";

            // Fetch email from Firestore
            try {
                const userDoc = await getDoc(doc(db, "user", currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.email) {
                        email = userData.email;
                    }
                }
            } catch (err) {
                console.error("Error fetching user email:", err);
            }

            // Generate TOTP
            const secret = new OTPAuth.Secret({ size: 20 });
            const totpInstance = new OTPAuth.TOTP({
                issuer: "SIA",
                label: email,
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: secret,
            });

            try {
                const qrUrl = await QRCode.toDataURL(totpInstance.toString(), {
                    width: 200,
                    margin: 2,
                    color: { dark: "#000000", light: "#ffffff" },
                });
                setTotpData({
                    totp: totpInstance,
                    secretKey: secret.base32,
                    qrCodeUrl: qrUrl,
                });
            } catch (err) {
                console.error("Error generating QR code:", err);
            }
        };

        initializeMFA();
    }, [isOpen, currentUser]);

    const handleVerify = async () => {
        if (!totpData || !currentUser) return;
        setIsVerifying(true);
        setError("");
        const delta = totpData.totp.validate({ token: verificationCode, window: 1 });
        if (delta !== null) {
            // Save MFA data to Firestore
            try {
                await updateDoc(doc(db, "user", currentUser.uid), {
                    mfaEnabled: true,
                    mfaSecret: totpData.secretKey,
                });
                console.log("MFA enabled and saved to Firestore");
            } catch (err) {
                console.error("Error saving MFA data:", err);
                setError("Failed to save MFA settings. Please try again.");
                setIsVerifying(false);
                return;
            }
            onConfirm();
            handleClose();
        } else {
            setError("Invalid verification code. Please try again.");
        }
        setIsVerifying(false);
    };

    const handleClose = () => {
        setVerificationCode("");
        setError("");
        setCopied(false);
        setTotpData(null);
        hasInitialized.current = false;
        onClose();
    };

    const copyToClipboard = () => {
        if (!totpData) return;
        navigator.clipboard.writeText(totpData.secretKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative z-10 w-full max-w-md mx-4 animate-[slideDown_0.3s_ease-out]">
                <div className="rounded-2xl border border-white/10 bg-[#1a1d21] p-6 shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Setup Two-Factor Authentication</h2>
                        <button onClick={handleClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="mb-4 text-sm text-gray-400">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.) or manually enter the key below.</p>
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-xl bg-white p-3">
                            {totpData?.qrCodeUrl ? (
                                <Image src={totpData.qrCodeUrl} alt="QR Code for 2FA" width={192} height={192} className="h-48 w-48" unoptimized />
                            ) : (
                                <div className="flex h-48 w-48 items-center justify-center">
                                    <svg className="h-8 w-8 animate-spin text-gray-400" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-xs font-medium text-gray-400">Or enter this key manually:</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <code className="text-sm font-mono text-[rgb(18,135,173)] break-all">{totpData?.secretKey || "Generating..."}</code>
                            </div>
                            <button onClick={copyToClipboard} disabled={!totpData} className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50" title="Copy to clipboard">
                                {copied ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-green-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block text-xs font-medium text-gray-400">Enter the 6-digit code from your authenticator app:</label>
                        <input type="text" value={verificationCode} onChange={(e) => { const value = e.target.value.replace(/\D/g, "").slice(0, 6); setVerificationCode(value); setError(""); }} placeholder="000000" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white outline-none transition-all focus:border-[rgb(18,135,173)] focus:bg-white/10 focus:ring-1 focus:ring-[rgb(18,135,173)]" maxLength={6} />
                        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleClose} className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10">Cancel</button>
                        <button onClick={handleVerify} disabled={verificationCode.length !== 6 || isVerifying || !totpData} className="flex-1 rounded-lg bg-[rgb(18,135,173)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[rgb(22,160,205)] disabled:cursor-not-allowed disabled:opacity-50">{isVerifying ? "Verifying..." : "Verify & Enable"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
