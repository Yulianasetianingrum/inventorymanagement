"use client";

import BarcodeScanner from "@/components/BarcodeScanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ScanPage() {
  const router = useRouter();
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const handleScan = (code: string) => {
    setScannedCode(code);
    // In a real app, you might query the DB here or redirect immediately
    // For now, we simulate a successful scan and redirect to result or show modal

    // Example: Redirect to a detail page or handle stock movement
    // router.push(`/worker/items/${code}`);

    // Or just show it for now:
    // navigate to items or somewhere useful. 
    // Since we don't know the exact worker flow, let's just assume we want to find the item.
    // However, worker usually picking or checking stock.
    // Let's redirect to history or a lookup page if it existed, for now let's just go back to home with a query param?
    // Or just stay here and show success.
  };

  return (
    <div className="p-4 space-y-4">
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>Scan Barang</h1>

      {scannedCode ? (
        <Card className="p-6 text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h2 className="text-xl font-bold text-navy">Scan Berhasil!</h2>
          <p className="font-mono text-lg bg-gray-100 py-2 rounded-lg">{scannedCode}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setScannedCode(null)} className="bg-white text-navy border-navy/20 hover:bg-gray-50">Scan Lagi</Button>
            <Button onClick={() => router.push(`/worker/home`)}>Selesai</Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <BarcodeScanner
            onScanSuccess={handleScan}
          />
        </Card>
      )}
    </div>
  );
}
