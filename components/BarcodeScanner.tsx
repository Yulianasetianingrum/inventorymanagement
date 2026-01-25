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
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [cameras, setCameras] = useState<any[]>([]);
    const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const regionId = "html5qr-code-full-region";

    // Capabilities
    const [capabilities, setCapabilities] = useState<MediaTrackCapabilities | null>(null);
    const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
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

    const applyVideoConstraints = async (track: MediaStreamTrack, advanced: any) => {
        try {
            await track.applyConstraints({ advanced: [advanced] });
        } catch (e) {
            console.error("Failed to apply constraints", e);
        }
    };

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

            const config = {
                fps: fps,
                qrbox: qrbox,
                disableFlip: disableFlip,
            };

            const cameraConfig = cameraId
                ? {
                    deviceId: { exact: cameraId },
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 },
                    focusMode: "continuous"
                }
                : {
                    facingMode: "environment",
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 },
                    focusMode: "continuous"
                };

            await html5QrCode.start(
                cameraConfig,
                config,
                (decodedText, decodedResult) => {
                    onScanSuccess(decodedText, decodedResult);
                },
                (errorMessage) => {
                    if (onScanFailure) {
                        onScanFailure(errorMessage);
                    }
                }
            );

            // Access track for controls
            // Html5Qrcode doesn't easily expose the track, but we can try getting it via capabilities
            try {
                const track = html5QrCode.getRunningTrack();
                if (track) {
                    setVideoTrack(track);
                    setCapabilities(track.getCapabilities());
                }
            } catch (e) {
                console.warn("Could not get running track", e);
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
                    const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('belakang') || d.label.toLowerCase().includes('environment'));
                    const targetId = backCamera ? backCamera.id : devices[0].id;
                    setActiveCameraId(targetId);
                    startScanning(targetId);
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
                                {/* Torch Toggle */}
                                {videoTrack && capabilities?.torch && (
                                    <Button
                                        onClick={() => {
                                            const newMode = !torchOn;
                                            applyVideoConstraints(videoTrack, { torch: newMode });
                                            setTorchOn(newMode);
                                        }}
                                        className={`h-10 w-10 p-0 rounded-full shadow-lg ${torchOn ? 'bg-yellow-400 text-black' : 'bg-white text-gray-700'}`}
                                    >
                                        🔦
                                    </Button>
                                )}
                            </div>

                            {/* Zoom Slider */}
                            {videoTrack && capabilities?.zoom && (
                                <div className="pointer-events-auto w-full max-w-xs bg-black/50 p-2 rounded-full backdrop-blur-sm">
                                    <input
                                        type="range"
                                        min={capabilities.zoom.min || 1}
                                        max={capabilities.zoom.max || 5}
                                        step={capabilities.zoom.step || 0.1}
                                        value={zoom}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setZoom(val);
                                            applyVideoConstraints(videoTrack, { zoom: val });
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

                    {cameras.length > 1 && (
                        <div className="flex justify-center">
                            <select
                                className="bg-white border border-gray-300 text-gray-700 text-xs py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20"
                                onChange={handleCameraChange}
                                value={activeCameraId || ""}
                            >
                                <option value="" disabled>Ganti Kamera</option>
                                {cameras.map((cam) => (
                                    <option key={cam.id} value={cam.id}>
                                        {cam.label || `Camera ${cam.id.slice(0, 5)}...`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="text-center text-xs text-gray-400">
                        Arahkan kamera ke barcode produk
                    </div>
                </>
            )}
        </div>
    );
};

export default BarcodeScanner;
