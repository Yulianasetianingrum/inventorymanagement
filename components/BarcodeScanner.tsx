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
    const [isSwitching, setIsSwitching] = useState(false);

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

    // Track current index for cycling
    const [camIndex, setCamIndex] = useState(0);

    const startScanning = async (mode: "environment" | "user" | "any" | "cycle") => {
        setError(null);
        addLog(`Req Start: ${mode}`);

        // 1. STOP & CLEAR
        if (scannerRef.current) {
            try {
                if ((scannerRef.current as any).isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (ignore) { }
        }

        // 2. DELAY
        await new Promise(r => setTimeout(r, 300));

        // 3. FORCE DOM CLEAR
        const regionEl = document.getElementById(regionId);
        if (regionEl) regionEl.innerHTML = "";

        // Base Config
        const html5QrCode = new Html5Qrcode(regionId, { verbose: true } as any);
        scannerRef.current = html5QrCode;

        const baseConfig = {
            fps: fps,
            // RESPONSIVE QR BOX (Fixes oversized box on mobile)
            qrbox: function (viewfinderWidth: number, viewfinderHeight: number) {
                let w = Math.floor(viewfinderWidth * 0.8);
                if (w > 450) w = 450;
                let h = Math.floor(w * 0.5);
                if (h < 150) h = 150;
                return { width: w, height: h };
            },
            enableScanning: true,
            disableFlip: disableFlip,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true }
        };

        // Helper
        const tryStart = async (label: string, camConfig: any): Promise<boolean> => {
            try {
                addLog(`Trying ${label}...`);
                await html5QrCode.start(camConfig, baseConfig, onScanSuccess, () => { });
                addLog(`${label} Success!`);

                // Keep-alive focus loop
                try {
                    const track = (html5QrCode as any).getRunningTrack();
                    if (track) {
                        setCapabilities(track.getCapabilities());
                        const activeTrack = track;
                        if (activeTrack.applyConstraints) {
                            activeTrack.applyConstraints({ advanced: [{ focusMode: "continuous" }] }).catch(() => { });
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

        // LOGIC: CYCLING ID vs FACING MODE
        try {
            // A. If "cycle" requested and we have cameras, pick next index
            if (mode === "cycle" && cameras.length > 1) {
                const nextIndex = (camIndex + 1) % cameras.length;
                setCamIndex(nextIndex); // Update state for next time
                const nextCam = cameras[nextIndex];

                if (await tryStart(`ID: ${nextCam.label}`, { deviceId: { exact: nextCam.id } })) return;
            }

            // B. If specific mode requested, try exact
            if (mode !== "cycle" && mode !== "any") {
                if (await tryStart(`Exact ${mode}`, { facingMode: { exact: mode } })) return;
                if (await tryStart(`Relaxed ${mode}`, { facingMode: mode })) return;
            }

            // C. Fallbacks
            if (cameras.length > 0) {
                // Try current index just in case
                if (await tryStart(`Fallback ID ${camIndex}`, { deviceId: { exact: cameras[camIndex].id } })) return;
            }

            if (await tryStart("Any Camera", { facingMode: undefined })) return;

            throw new Error("Gagal membuka kamera. Coba refresh halaman.");

        } catch (finalErr: any) {
            setError(finalErr.message || "Camera Error");
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
                        {/* Manual Switchers */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-auto">
                            <Button
                                onClick={async () => {
                                    if (isSwitching) return;
                                    setIsSwitching(true);
                                    // Use new cycling logic
                                    try {
                                        await startScanning("cycle");
                                    } finally {
                                        setIsSwitching(false);
                                    }
                                }}
                                className={`h-9 px-4 text-xs font-bold border shadow-sm transition-all ${isSwitching ? "bg-gray-100 text-gray-400" : "bg-white text-navy border-gray-200"}`}
                                title="Switch Camera"
                                disabled={isSwitching}
                            >
                                {isSwitching ? (
                                    <span className="animate-spin mr-2">⏳</span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                        <path d="M20 10c0-6-8-6-8-6s-8 0-8 6h3l-5 5-5-5h3c0-10 12-10 12-10s12 0 12 10h-3l5 5 5-5z" />
                                    </svg>
                                )}
                                {isSwitching ? "Switching..." : "Switch Camera"}
                            </Button>
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
