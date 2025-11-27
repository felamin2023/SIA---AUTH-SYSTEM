"use client";

import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan?: (result: string) => void;
}

export default function QRScannerModal({
    isOpen,
    onClose,
    onScan,
}: QRScannerModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const onScanRef = useRef(onScan);
    const [cameraState, setCameraState] = useState<{
        isLoading: boolean;
        error: string | null;
    }>({ isLoading: true, error: null });
    const [retryCount, setRetryCount] = useState(0);
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const scannedResultRef = useRef(scannedResult);

    // Keep refs in sync
    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        scannedResultRef.current = scannedResult;
    }, [scannedResult]);

    useEffect(() => {
        if (!isOpen) {
            // Stop camera when modal closes
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            // Reset scanned result via ref
            scannedResultRef.current = null;
            return;
        }

        // QR code scanning function
        const scanQRCode = () => {
            if (!videoRef.current || !canvasRef.current || scannedResultRef.current) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    setScannedResult(code.data);
                    if (onScanRef.current) {
                        onScanRef.current(code.data);
                    }
                    return; // Stop scanning once we find a code
                }
            }

            // Continue scanning
            animationFrameRef.current = requestAnimationFrame(scanQRCode);
        };

        // Start camera when modal opens
        let isMounted = true;

        navigator.mediaDevices
            .getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            })
            .then(async (stream) => {
                if (!isMounted) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    // Start QR code scanning
                    animationFrameRef.current = requestAnimationFrame(scanQRCode);
                }

                setCameraState({ isLoading: false, error: null });
            })
            .catch((err) => {
                console.error("Error accessing camera:", err);
                if (isMounted) {
                    setCameraState({
                        isLoading: false,
                        error: "Unable to access camera. Please ensure you have granted camera permissions.",
                    });
                }
            });

        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isOpen, retryCount]);

    function handleClose() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        onClose();
    }

    function handleRetry() {
        setCameraState({ isLoading: true, error: null });
        setRetryCount((prev) => prev + 1);
    }

    const { isLoading, error } = cameraState;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg mx-4 animate-[slideDown_0.3s_ease-out]">
                <div className="rounded-2xl border border-white/10 bg-[#1a1d21] p-6 shadow-2xl">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Scan QR Code</h2>
                        <button
                            onClick={handleClose}
                            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Camera View */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black">
                                <div className="flex flex-col items-center gap-3">
                                    <svg
                                        className="h-8 w-8 animate-spin text-[rgb(18,135,173)]"
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
                                    <span className="text-sm text-gray-400">
                                        Starting camera...
                                    </span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
                                <div className="text-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="mx-auto mb-3 h-12 w-12 text-red-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                        />
                                    </svg>
                                    <p className="text-sm text-red-400">{error}</p>
                                    <button
                                        onClick={handleRetry}
                                        className="mt-4 rounded-lg bg-[rgb(18,135,173)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgb(22,160,205)]"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            className="h-full w-full object-cover"
                            playsInline
                            muted
                        />

                        {/* Hidden canvas for QR code processing */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* QR Scanner Overlay */}
                        {!error && !isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Scanner Frame */}
                                <div className="relative h-48 w-48">
                                    {/* Corner Borders */}
                                    <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-[rgb(18,135,173)]" />
                                    <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-[rgb(18,135,173)]" />
                                    <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-[rgb(18,135,173)]" />
                                    <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-[rgb(18,135,173)]" />

                                    {/* Scanning Line Animation */}
                                    <div className="absolute left-2 right-2 top-0 h-0.5 animate-[scanLine_2s_ease-in-out_infinite] bg-[rgb(18,135,173)] shadow-[0_0_8px_rgba(18,135,173,0.8)]" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <p className="mt-4 text-center text-sm text-gray-400">
                        Position the QR code within the frame to scan
                    </p>
                </div>
            </div>

            {/* Custom Animation Keyframes */}
            <style jsx>{`
        @keyframes scanLine {
          0%,
          100% {
            top: 0;
          }
          50% {
            top: calc(100% - 2px);
          }
        }
      `}</style>
        </div>
    );
}
