"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "./ui/button";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string, decodedResult: any) => void;
    onScanFailure?: (error: any) => void;
    fps?: number;
    qrbox?: number | { width: number; height: number };
    disableFlip?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
    onScanSuccess,
    onScanFailure,
    fps = 10,
    qrbox = { width: 250, height: 250 },
    disableFlip = false,
}) => {
    // State
    const [focusStatus, setFocusStatus] = useState<"idle" | "focusing">("idle");
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [cameras, setCameras] = useState<any[]>([]);

    // NUCLEAR OPTION: Track requested facing mode explicitly
    const [requestedFacingMode, setRequestedFacingMode] = useState<"environment" | "user">("environment");

    // Refs
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const regionId = "html5qr-code-full-region";

    // Capabilities
    const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);
    const [torchOn, setTorchOn] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setDebugLog(prev => [msg, ...prev].slice(0, 5));
        console.log("[ScannerDebug]", msg);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            // Safe cleanup: Only stop if it's actually running
            if (scannerRef.current) {
                try {
                    // Check undocumented 'isScanning' flag if available to avoid error
                    if ((scannerRef.current as any).isScanning) {
                        scannerRef.current.stop().catch((err) => console.warn("Cleanup stop warn:", err));
                    }
                    scannerRef.current.clear();
                } catch (e) {
                    console.warn("Cleanup error", e);
                }
            }
        };
    }, []);

    const startScanning = async (mode: "environment" | "user" | "any") => {
        setError(null);
        addLog(`Req Start: ${mode}`);

        // Stop specific previous stream
        if (scannerRef.current) {
            try {
                // Check undocumented 'isScanning' flag if available to avoid error
                if ((scannerRef.current as any).isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (ignore) { }
        }

        // Base Config
        const html5QrCode = new Html5Qrcode(regionId, { verbose: true } as any);
        scannerRef.current = html5QrCode;

        const baseConfig = {
            fps: fps,
            // LANDSCAPE BOX (Widened for desktop/User request)
            qrbox: { width: 450, height: 200 },
            enableScanning: true,
            disableFlip: disableFlip,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true }
        };

        // Helper to try a specific config
        const tryStart = async (label: string, camConfig: any): Promise<boolean> => {
            try {
                addLog(`Trying ${label}...`);
                await html5QrCode.start(camConfig, baseConfig, onScanSuccess, () => { });
                addLog(`${label} Success!`);

                // POST-START FIXES
                try {
                    const track = (html5QrCode as any).getRunningTrack();
                    if (track) {
                        setCapabilities(track.getCapabilities());

                        // AGGRESSIVE FOCUS LOOP
                        // Many devices lose focus. We force it every 2.5s to keep it sharp.
                        const activeTrack = track;
                        if (activeTrack.applyConstraints) {
                            activeTrack.applyConstraints({ advanced: [{ focusMode: "continuous" }] }).catch(() => { });

                            // Clear previous interval if any (not easily tracked here without ref, but okay for now)
                            // Set new interval attached to this closure
                            const intervalId = setInterval(() => {
                                if (!scannerRef.current) clearInterval(intervalId);
                                activeTrack.applyConstraints({ advanced: [{ focusMode: "continuous" }] }).catch(() => { });
                            }, 2500);
                        }
                    }
                } catch (e) { }

                return true;
            } catch (e: any) {
                addLog(`${label} Failed: ${JSON.stringify(e)}`);
                return false;
            }
        };

        // CASCADE OF DESPERATION
        try {
            // Priority 1: Requested Mode (Exact)
            if (mode !== "any") {
                if (await tryStart("Exact Mode", { facingMode: { exact: mode } })) return;

                // Priority 2: Requested Mode (Relaxed)
                if (await tryStart("Relaxed Mode", { facingMode: mode })) return;
            }

            // Priority 3: The "Other" Mode (If environment failed, try user, or vice versa)
            const alternate = mode === "environment" ? "user" : "environment";
            if (await tryStart("Alternate Mode", { facingMode: alternate })) return;

            // Priority 4: ANY CAMERA (No constraints)
            if (await tryStart("Generic/Any", { facingMode: undefined })) return;

            // Priority 5: ID-based (If we found cameras)
            if (cameras.length > 0) {
                if (await tryStart("ID-Based (First)", { deviceId: cameras[0].id })) return;
            }

            throw new Error("Semua metode gagal. Browser menolak akses kamera.");

        } catch (finalErr: any) {
            setError(finalErr.message || "Gagal membuka kamera.");
            setHasPermission(false);
        }
    };

    // Initial Start
    useEffect(() => {
        // 0. SECURE CONTEXT CHECK
        if (typeof window !== "undefined" && window.isSecureContext === false) {
            setError("CRITICAL: Camera requires HTTPS or Localhost. Current connection is insecure (HTTP). Cannot access camera hardware.");
            return;
        }

        // Enumerate just for debug info
        Html5Qrcode.getCameras().then(setCameras).catch(() => { });
        // Start blindly with environment
        startScanning("environment");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="w-full flex flex-col gap-4">
            {/* ... (Debug Overlay) ... */}

            {error ? (
                // ... (Error UI) ...
                <div className="bg-red-50 text-red-600 p-4 rounded text-center text-xs break-words border border-red-200 shadow-sm">
                    <strong className="block mb-2 text-sm">Camera Error</strong>
                    {error} <br />
                    <div className="mt-3 text-[10px] text-gray-500 font-mono">
                        Troubleshooting: <br />
                        1. Check Permission (Allow Camera) <br />
                        2. Check HTTPS (Must be secure) <br />
                        3. Close other apps using camera
                    </div>
                    <Button onClick={() => window.location.reload()} className="mt-4 h-8 px-4 text-xs bg-white border border-red-200 text-red-600 hover:bg-red-50">
                        Try Reloading
                    </Button>
                </div>
            ) : (
                <>
                    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-black/5">
                        <div id={regionId} className="w-full min-h-[300px]" />

                        {/* Control Overlay */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 pointer-events-none">
                            {/* ... (Buttons) ... */}
                            {/* Manual Switchers */}
                            <div className="pointer-events-auto flex gap-2">
                                <Button
                                    onClick={() => {
                                        const newMode = requestedFacingMode === "environment" ? "user" : "environment";
                                        setRequestedFacingMode(newMode);
                                        startScanning(newMode);
                                    }}
                                    className="h-8 bg-white text-navy border border-gray-200 shadow-sm"
                                    title="Switch Camera"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 10c0-6-8-6-8-6s-8 0-8 6h3l-5 5-5-5h3c0-10 12-10 12-10s12 0 12 10h-3l5 5 5-5z" />
                                    </svg>
                                    <span className="ml-2 text-[10px] font-bold">Switch</span>
                                </Button>
                            </div>

                            <div className="flex flex-col gap-2 pointer-events-auto">
                                <div className="flex gap-2">
                                    <Button
                                        className="h-8 bg-white text-navy text-[10px]"
                                        onClick={() => {
                                            if (scannerRef.current) {
                                                setFocusStatus("focusing");
                                                const scannerAny = scannerRef.current as any;
                                                let track = null;
                                                if (typeof scannerAny.getRunningTrack === "function") track = scannerAny.getRunningTrack();
                                                else if (scannerAny.mediaStream?.getVideoTracks) track = scannerAny.mediaStream.getVideoTracks()[0];

                                                if (track?.applyConstraints) {
                                                    track.applyConstraints({ advanced: [{ focusMode: "manual" as any }] })
                                                        .catch(() => { })
                                                        .finally(() => {
                                                            setTimeout(() => {
                                                                track.applyConstraints({ advanced: [{ focusMode: "continuous" }] }).catch(() => { });
                                                                setFocusStatus("idle");
                                                            }, 300);
                                                        });
                                                } else {
                                                    setTimeout(() => setFocusStatus("idle"), 500);
                                                }
                                            }
                                        }}
                                    >
                                        {focusStatus === "focusing" ? "Fokus..." : "Fokus"}
                                    </Button>

                                    {/* ZOOM SLIDER (Restored) */}
                                    <div className="flex items-center bg-black/40 rounded px-2">
                                        <span className="text-[10px] text-white mr-1 font-bold">Zoom</span>
                                        <input
                                            type="range"
                                            min="1" max="3" step="0.1"
                                            defaultValue="1"
                                            className="w-20 h-1 accent-white"
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                if (scannerRef.current) {
                                                    const scannerAny = scannerRef.current as any;
                                                    let track = null;
                                                    if (typeof scannerAny.getRunningTrack === "function") track = scannerAny.getRunningTrack();
                                                    else if (scannerAny.mediaStream?.getVideoTracks) track = scannerAny.mediaStream.getVideoTracks()[0];

                                                    if (track?.applyConstraints) {
                                                        track.applyConstraints({ advanced: [{ zoom: val }] }).catch(() => { });
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-xs text-red-600 font-bold tracking-wide uppercase animate-pulse">
                                JANGAN TERLALU DEKAT! (Mundur 20cm)
                            </span>
                        </div>
                        <div className="text-center text-[10px] text-gray-400">
                            {cameras.map(c => c.label).join(", ")}
                        </div>
                    </div>
                </>
            )
            }
        </div >
    );
};

export default BarcodeScanner;
