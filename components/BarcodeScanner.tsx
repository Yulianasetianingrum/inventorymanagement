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
    const [focusStatus, setFocusStatus] = useState<"idle" | "focusing">("idle");
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [cameras, setCameras] = useState<any[]>([]);
    const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const regionId = "html5qr-code-full-region";

    // Capabilities
    const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);
    const [torchOn, setTorchOn] = useState(false);
    const [zoom, setZoom] = useState(1);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error).finally(() => {
                    if (scannerRef.current) {
                        try {
                            scannerRef.current.clear();
                        } catch (e) {
                            console.error("Failed to clear scanner", e);
                        }
                    }
                });
            }
        };
    }, []);

    const startScanning = async (cameraId?: string) => {
        setError(null);
        try {
            if (scannerRef.current) {
                await scannerRef.current.stop().catch(() => { });
            }

            const formatsToSupport = [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_93,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.ITF,
            ];

            const html5QrCode = new Html5Qrcode(regionId, { formatsToSupport, verbose: false } as any);
            scannerRef.current = html5QrCode;

            // Config with Native Detector support
            const config = {
                fps: fps,
                // Make the scan region rectangular (wider) by default to fit Barcodes better.
                // A square box cuts off long EAN-13 barcodes unless you are very far away (low res).
                // width: 80% of min dimension, height: 250px max
                qrbox: { width: 320, height: 150 },
                enableScanning: true,
                disableFlip: disableFlip,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            };

            // Simplified Camera Config (Let Browser Decide Resolution)
            // Sweet Spot: 720p is supported by almost all cameras and is sharp enough for Barcodes.
            // Avoid "exact" constraints as they cause failures.
            // Simplified Camera Config
            // 1. Remove "focusMode" from here (it causes startup crashes on some devices)
            // 2. Use "ideal" not "exact" for resolution
            // 1. First Argument: Camera Identifier (STRICTLY ONE KEY)
            const cameraIdentifier = cameraId
                ? { deviceId: { exact: cameraId } }
                : { facingMode: "environment" };

            // 2. Second Argument: Configuration & Video Constraints
            const currentConfig = {
                ...config,
                videoConstraints: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    // focusMode is experimental, cast to any to avoid TS error
                    advanced: [{ focusMode: "continuous" }] as any,
                }
            };

            try {
                await html5QrCode.start(
                    cameraIdentifier,
                    currentConfig,
                    (decodedText, decodedResult) => {
                        onScanSuccess(decodedText, decodedResult);
                    },
                    (errorMessage) => {
                        if (onScanFailure) {
                            onScanFailure(errorMessage);
                        }
                    }
                );
            } catch (err: any) {
                console.error("Camera HQ start failed, retrying generic...", err);

                // Suppress "not running" error specifically
                try {
                    if (html5QrCode.isScanning) {
                        await html5QrCode.stop();
                    }
                } catch (stopErr) { /* ignore */ }

                // Fallback: Safe Mode (No extra constraints)
                try {
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        config, // Use base config without videoConstraints
                        (t, r) => onScanSuccess(t, r),
                        (e) => onScanFailure?.(e)
                    );
                } catch (finalErr) {
                    throw finalErr;
                }
            }

            // Access capabilities and Auto-Apply Focus & Zoom (Post-Start)
            try {
                // Cast to any to check availability if types are outdated
                const caps = (html5QrCode as any).getRunningTrackCameraCapabilities();
                if (caps) setCapabilities(caps);

                const track = (html5QrCode as any).getRunningTrack();
                if (track) {
                    // 1. Force Continuous Focus
                    track.applyConstraints({ advanced: [{ focusMode: "continuous" }] })
                        .catch((e: any) => console.log("Auto-focus not supported", e));

                    // 2. Default Zoom to 2.0x (or max available) to fix "Too Close/Blurry" verification
                    // Many phones can't focus < 10cm. Zoom allows standing back ~20cm.
                    if (caps?.zoom) {
                        const defaultZoom = Math.min(caps.zoom.max || 1, 2.0); // Cap at 2x default
                        if (defaultZoom > 1) {
                            track.applyConstraints({ advanced: [{ zoom: defaultZoom }] })
                                .then(() => setZoom(defaultZoom))
                                .catch((e: any) => console.log("Auto-zoom failed", e));
                        }
                    }
                }
            } catch (e) {
                console.warn("Could not get track capabilities", e);
            }

            setHasPermission(true);
        } catch (err: any) {
            console.error("Error starting scanner:", err);
            setError(err.message || "Gagal memulai kamera.");
            setHasPermission(false);
        }
    };

    useEffect(() => {
        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices && devices.length) {
                    setCameras(devices);
                    // 1. Try to find explicit "back" or "environment" camera
                    const backCamera = devices.find(d =>
                        d.label.toLowerCase().includes('back') ||
                        d.label.toLowerCase().includes('belakang') ||
                        d.label.toLowerCase().includes('environment')
                    );

                    if (backCamera) {
                        // Found it! Use this specific ID.
                        setActiveCameraId(backCamera.id);
                        startScanning(backCamera.id);
                    } else if (devices.length > 0 && devices[0].label) {
                        // If labels exist but no "back" found, default to first one (better than nothing)
                        setActiveCameraId(devices[0].id);
                        startScanning(devices[0].id);
                    } else {
                        // Labels are empty (privacy issue) or ambiguous. 
                        // DO NOT PRE-SELECT ID. Let startScanning() use { facingMode: "environment" }
                        console.warn("No labeled back camera found, defaulting to generic environment config.");
                        setActiveCameraId(null);
                        startScanning(); // No ID passed -> defaults to facingMode: "environment"
                    }
                } else {
                    console.warn("No cameras found via enumeration, trying generic start...");
                    startScanning();
                }
            })
            .catch((err) => {
                console.error("Camera listing failed, forcing generic start:", err);
                startScanning();
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setActiveCameraId(id);
        startScanning(id);
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center text-sm font-bold">
                    {error}
                    <div className="mt-2">
                        <Button onClick={() => window.location.reload()} className="bg-white text-navy border hover:bg-gray-50 text-xs h-8">
                            Coba Lagi
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-black/5">
                        <div id={regionId} className="w-full min-h-[300px]" />

                        {/* CONTROLS OVERLAY */}
                        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 px-4 pointer-events-none">
                            <div className="pointer-events-auto flex gap-4">
                                {/* Focus Button (New) */}
                                <Button
                                    onClick={() => {
                                        if (scannerRef.current) {
                                            setFocusStatus("focusing");
                                            // Aggressive Focus Hack: Toggle mode or re-apply
                                            // Cast to any because getRunningTrack might be missing in type defs
                                            const track = (scannerRef.current as any).getRunningTrack();
                                            if (track) {
                                                // Try to force "single-shot" then back to "continuous"
                                                track.applyConstraints({ advanced: [{ focusMode: "manual" as any }] })
                                                    .then(() => new Promise(r => setTimeout(r, 200)))
                                                    .then(() => track.applyConstraints({ advanced: [{ focusMode: "continuous" }] }))
                                                    .catch((e: any) => {
                                                        console.warn("Focus force failed", e);
                                                        // Fallback just re-apply continuous
                                                        track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
                                                    })
                                                    .finally(() => setTimeout(() => setFocusStatus("idle"), 1000));
                                            }
                                        }
                                    }}
                                    className="h-10 px-4 rounded-full shadow-lg bg-white text-navy font-bold text-xs"
                                >
                                    {focusStatus === "focusing" ? "Fokus..." : "🎯 Fokus"}
                                </Button>

                                {/* Torch Toggle */}
                                {(capabilities as any)?.torch && (
                                    <Button
                                        onClick={() => {
                                            if (scannerRef.current) {
                                                const newMode = !torchOn;
                                                scannerRef.current.applyVideoConstraints({ advanced: [{ torch: newMode }] } as any)
                                                    .then(() => setTorchOn(newMode))
                                                    .catch(e => console.error("Torch failed", e));
                                            }
                                        }}
                                        className={`h-10 w-10 p-0 rounded-full shadow-lg ${torchOn ? 'bg-yellow-400 text-black' : 'bg-white text-gray-700'}`}
                                    >
                                        🔦
                                    </Button>
                                )}
                            </div>

                            {/* Zoom Slider */}
                            {(capabilities as any)?.zoom && (
                                <div className="pointer-events-auto w-full max-w-xs bg-black/50 p-2 rounded-full backdrop-blur-sm">
                                    <input
                                        type="range"
                                        min={(capabilities as any).zoom.min || 1}
                                        max={(capabilities as any).zoom.max || 5}
                                        step={(capabilities as any).zoom.step || 0.1}
                                        value={zoom}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setZoom(val);
                                            if (scannerRef.current) {
                                                scannerRef.current.applyVideoConstraints({ advanced: [{ zoom: val }] } as any)
                                                    .catch(console.warn);
                                            }
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-white/50 rounded-lg"></div>
                        </div>
                    </div>

                    {cameras.length > 0 && (
                        <div className="flex flex-col gap-2 justify-center items-center">
                            {/* Manual Camera Cycler */}
                            <Button
                                onClick={() => {
                                    if (cameras.length > 1) {
                                        const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
                                        const nextIndex = (currentIndex + 1) % cameras.length;
                                        const nextCam = cameras[nextIndex];
                                        setActiveCameraId(nextCam.id);
                                        startScanning(nextCam.id);
                                    } else {
                                        // If only 1 camera listed but user wants to switch, try toggling facingMode blind
                                        startScanning(); // Default restart might pick the other one if constraint changes? 
                                        // Actually better to just reload with diff constraint if possible, but for now just restart.
                                        alert("Hanya 1 kamera terdeteksi. Coba refresh.");
                                    }
                                }}
                                className="bg-white border border-navy text-navy text-xs py-2 px-4 rounded-full shadow-sm hover:bg-gray-50"
                            >
                                🔄 Putar Kamera ({cameras.length})
                            </Button>

                            {/* Debug Info (To see why 'Back' is Front) */}
                            <div className="text-[10px] text-gray-400 max-w-[200px] text-center overflow-hidden text-ellipsis whitespace-nowrap">
                                Aktif: {cameras.find(c => c.id === activeCameraId)?.label || activeCameraId || "Auto"}
                            </div>
                        </div>
                    )}

                    <div className="text-center text-xs text-gray-400 font-medium">
                        🔍 Mundur sedikit jika buram (Zoom aktif otomatis)
                    </div>
                </>
            )}
        </div>
    );
};

export default BarcodeScanner;
