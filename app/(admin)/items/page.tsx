"use client";

import React, { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./items.module.css";
import { Button } from "@/components/ui/button";
import { Html5Qrcode } from "html5-qrcode";

type FilterOption = "priority" | "all" | "low" | "empty";
type ItemRow = {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  location: string | null;
  size: string | null;
  unit: string;
  barcode?: string | null;
  defaultSupplierId?: number | null;
  defaultSupplierName?: string | null;
  stockNew: number;
  stockUsed: number;
  stockTotal: number;
  minStock: number;
  statusRefill: "Aman" | "Wajib Refill" | "Habis";
  nilaiStok: number;
  updatedAt: string;
};

type SupplierRow = {
  id: number;
  name: string;
  waNumber: string | null;
  keywords: string[];
  mapsUrl?: string | null;
  address?: string | null;
  lastPrice?: number | null;
  lastPriceAt?: string | null;
};

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json" } });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login?error=unauthorized";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const text = await res.text();
    let errorMsg = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error) errorMsg = parsed.error;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

const SmartSupplierInput = ({
  value,
  onChange,
  onSelect,
  placeholder = "Cari Supplier..."
}: {
  value: string;
  onChange: (val: string) => void;
  onSelect: (id: number | null, name: string) => void;
  placeholder?: string;
}) => {
  const [suggestions, setSuggestions] = useState<SupplierRow[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!value || value.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/admin/suppliers?q=${value}`);
        const json = await res.json();
        // Map API response (namaToko) to component structure (name)
        const list = (json.data || []).map((s: any) => ({
          id: s.id,
          name: s.namaToko || s.name || "",
          address: s.alamat || s.address
        }));
        setSuggestions(list);
      } catch (e) { }
    }, 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="relative w-full">
      <input
        className={styles.formInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onSelect(null, e.target.value); // Reset ID, keep name
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
      />
      {show && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 shadow-lg rounded-md mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              className="w-full text-left px-3 py-2 text-xs hover:bg-navy/5 border-b border-gray-50 last:border-0"
              onClick={() => {
                onSelect(s.id, s.name);
                onChange(s.name);
                setShow(false);
              }}
            >
              <div className="font-bold text-navy">{s.name}</div>
              {s.address && <div className="text-[10px] text-gray-400 truncate">{s.address}</div>}
            </button>
          ))}
          <div className="p-2 text-[10px] text-center text-gray-400 bg-gray-50">
            Ketik manual untuk buat baru
          </div>
        </div>
      )}
    </div>
  );
};

function AdminItemsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [actionMenu, setActionMenu] = useState<{
    id: number;
    item: ItemRow;
    left: number;
    top: number;
    dir: "down" | "up";
  } | null>(null);

  // Modals & Forms State
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemRow | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ItemRow | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [dropAllModalOpen, setDropAllModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [toast, setToast] = useState<{ msg: string; error?: boolean; visible: boolean }>({ msg: "", visible: false });

  // ... (existing form states) ...

  const handleDropAll = async () => {
    if (!adminPassword) return showToast("Masukkan password admin!", true);
    setLoading(true);
    try {
      const res = await fetchJson("/api/admin/items/drop-all", {
        method: "DELETE",
        body: JSON.stringify({ password: adminPassword })
      });
      showToast(res.message || "Database berhasil di-reset");
      setDropAllModalOpen(false);
      setAdminPassword("");
      setSearch(""); // Clear search to show clean empty state
      loadItems();
    } catch (e: any) {
      showToast(e.message, true);
    } finally {
      setLoading(false);
    }
  };

  // ... (existing loadItems, useEffects, etc) ...

  // --- Reference Logic: Bulk Items & Advanced State ---
  const [itemMode, setItemMode] = useState<"single" | "bulk">("single");
  const [bulkItems, setBulkItems] = useState<any[]>([
    {
      name: "", brand: "", category: "", location: "", size: "", unit: "pcs",
      unitQty: "satuan", isiPerPack: "", priceType: "per_satuan", minStock: "0", qty: "", harga: "",
      supplierId: 0, supplierName: ""
    }
  ]);
  const [bulkSuppliers, setBulkSuppliers] = useState<SupplierRow[]>([]);
  const [bulkSelectedSupplier, setBulkSelectedSupplier] = useState<{ id: number | null; name: string | null }>({ id: null, name: null });
  const [supplierSearch, setSupplierSearch] = useState(""); // For bulk supplier search

  // Single Item Logic (Advanced)
  const [singleSelectedSupplier, setSingleSelectedSupplier] = useState<{ id: number | null; name: string | null }>({ id: null, name: null });

  const [stockForm, setStockForm] = useState({
    date: new Date().toISOString().split("T")[0],
    qty: "",
    mode: "baru" as "baru" | "bekas",
    harga: "",
    note: "",
    unitQty: "satuan" as "satuan" | "pack",
    isiPerPack: "",
    priceType: "per_satuan" as "per_satuan" | "per_pack"
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    brand: "",
    category: "",
    location: "",
    size: "",
    unit: "pcs",
    minStock: "0",
    barcode: ""
  });

  // Supplier Logic
  const [stockSuppliers, setStockSuppliers] = useState<SupplierRow[]>([]);
  const [stockSupplierQuery, setStockSupplierQuery] = useState("");
  const [selectedStockSupplier, setSelectedStockSupplier] = useState<{ id: number | null; name: string | null }>({ id: null, name: null });

  const showToast = (msg: string, error = false) => {
    setToast({ msg, error, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  // Load Items
  const loadItems = async (nextFilter?: FilterOption) => {
    const effectiveFilter = nextFilter ?? filter;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search.trim()) q.set("search", search.trim());
      q.set("filter", effectiveFilter === "priority" ? "all" : effectiveFilter);
      const data = await fetchJson(`/api/admin/items?${q.toString()}`);
      let list = data.data ?? [];
      if (effectiveFilter === "priority") {
        list = list.filter((i: ItemRow) => i.statusRefill !== "Aman");
      }
      setItems(list);
    } catch (e) {
      showToast("Gagal mengambil data items", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const f = String(searchParams?.get("filter") || "").trim();
    if (f === "priority" || f === "all" || f === "low" || f === "empty") setFilter(f as FilterOption);
    loadItems();
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => loadItems(), 300);
    return () => clearTimeout(t);
  }, [search]);

  // --- Reference: Supplier Loading Logic ---
  const loadStockSuppliers = useCallback(async (item: ItemRow, q?: string) => {
    try {
      const params = new URLSearchParams();
      params.set("itemId", String(item.id));
      if (q?.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/suppliers/recommend?${params.toString()}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      const list = Array.isArray(data?.recommended) ? data.recommended : Array.isArray(data?.all) ? data.all : [];
      setStockSuppliers(list.map((s: any) => ({
        id: Number(s.id),
        name: String(s.name || s.namaToko || ""),
        waNumber: s.waNumber || "",
        keywords: [],
        address: s.address
      })));
    } catch (e) {
      console.error("Failed load suppliers", e);
    }
  }, []);

  useEffect(() => {
    if (!stockModalOpen || !selectedItem) return;
    const t = setTimeout(() => {
      loadStockSuppliers(selectedItem, stockSupplierQuery);
    }, 320);
    return () => clearTimeout(t);
  }, [stockModalOpen, selectedItem, stockSupplierQuery, loadStockSuppliers]);

  // --- Logic: Submit Stock (Advanced) ---
  const handleStockSubmit = async () => {
    if (!selectedItem) return;
    const qty = Number(stockForm.qty);
    const isiPerPack = Number(stockForm.isiPerPack);
    const qtyBase = stockForm.unitQty === "pack" ? qty * (isiPerPack || 0) : qty;

    // Validasi basic
    if (qty <= 0) return showToast("Qty wajib diisi", true);

    try {
      await fetchJson(`/api/admin/items/${selectedItem.id}/stock-in`, {
        method: "POST",
        body: JSON.stringify({
          date: stockForm.date,
          qty,
          unitQty: stockForm.unitQty,
          isiPerPack: stockForm.unitQty === "pack" ? isiPerPack : undefined,
          harga: Number(stockForm.harga),
          priceType: stockForm.priceType,
          mode: stockForm.mode,
          note: stockForm.note,
          supplierId: stockForm.mode === "bekas" ? undefined : selectedStockSupplier.id ?? undefined,
          supplierName: selectedStockSupplier.name
        })
      });
      showToast("Stok berhasil diperbarui");
      setStockModalOpen(false);
      loadItems();
    } catch (e: any) {
      showToast(e.message, true);
    }
  };

  // --- Logic: Submit Item (Bulk/Single) ---
  const handleItemSubmit = async () => {
    if (itemMode === "single") {
      try {
        const method = editTargetId ? "PUT" : "POST";
        const url = editTargetId ? `/api/admin/items/${editTargetId}` : "/api/admin/items";
        const payload = { ...itemForm, minStock: Number(itemForm.minStock) };

        const res = await fetchJson(url, { method, body: JSON.stringify(payload) });

        // If NEW item + stock info filled (Reference logic)
        if (!editTargetId && Number(stockForm.qty) > 0) {
          const newId = res.data?.id || res.id;
          await fetchJson(`/api/admin/items/${newId}/stock-in`, {
            method: "POST",
            body: JSON.stringify({
              date: new Date().toISOString().split("T")[0],
              qty: Number(stockForm.qty),
              unitQty: stockForm.unitQty,
              isiPerPack: stockForm.unitQty === "pack" ? Number(stockForm.isiPerPack) : undefined,
              harga: Number(stockForm.harga),
              priceType: "per_satuan",
              mode: "baru",
              supplierId: singleSelectedSupplier.id,
              supplierName: singleSelectedSupplier.name
            })
          });
        }

        showToast(`Item berhasil ${editTargetId ? "diperbarui" : "dibuat"}`);
        setItemFormOpen(false);
        setEditTargetId(null);
        loadItems();
      } catch (e: any) {
        showToast(e.message, true);
      }
    } else {
      // BULK LOGIC
      if (!bulkSelectedSupplier.id) return showToast("Pilih supplier untuk batch ini", true);

      const validItems = bulkItems.filter(r => r.name && r.brand && r.qty > 0);
      if (validItems.length === 0) return showToast("Isi minimal 1 item lengkap", true);

      try {
        // Loop creation (Simplified adaptation of Reference logic)
        for (const row of validItems) {
          // 1. Create/Find Item
          const itemPayload = {
            name: row.name, brand: row.brand, category: row.category,
            location: row.location, size: row.size, unit: row.unit,
            minStock: Number(row.minStock)
          };
          const created = await fetchJson("/api/admin/items", { method: "POST", body: JSON.stringify(itemPayload) });
          const newId = created.data?.id || created.id;

          // 2. Stock In
          if (newId) {
            await fetchJson(`/api/admin/items/${newId}/stock-in`, {
              method: "POST",
              body: JSON.stringify({
                date: new Date().toISOString().split("T")[0],
                qty: Number(row.qty),
                unitQty: row.unitQty,
                isiPerPack: row.unitQty === "pack" ? Number(row.isiPerPack) : undefined,
                harga: Number(row.harga),
                priceType: row.priceType,
                mode: "baru",
                supplierId: row.supplierId,
                supplierName: row.supplierName
              })
            });
          }
        }
        showToast(`Berhasil memproses ${validItems.length} item`);
        setItemFormOpen(false);
        setBulkItems([{ name: "", brand: "", category: "", location: "", size: "", unit: "pcs", unitQty: "satuan", isiPerPack: "", priceType: "per_satuan", minStock: "0", qty: "", harga: "", supplierId: 0, supplierName: "" }]);
        loadItems();
      } catch (e: any) {
        showToast("Gagal memproses bulk items: " + e.message, true);
      }
    }
  };

  const loadBulkSuppliers = async (q: string) => {
    // Fetch logic for bulk suppliers
    try {
      const res = await fetch(`/api/admin/suppliers?q=${q}`);
      const json = await res.json();
      setBulkSuppliers(json.data || []);
    } catch (e) { }
  };

  useEffect(() => {
    if (itemFormOpen && itemMode === "bulk") {
      const t = setTimeout(() => loadBulkSuppliers(supplierSearch), 300);
      return () => clearTimeout(t);
    }
  }, [itemFormOpen, itemMode, supplierSearch]);


  const toggleActionMenu = useCallback((e: React.MouseEvent, item: ItemRow) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dir = spaceBelow < 200 ? "up" : "down";
    setActionMenu({ id: item.id, item, left: rect.left - 140, top: dir === "down" ? rect.bottom + 8 : rect.top - 8, dir });
  }, []);

  // --- Barcode Logic ---
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  // Use a ref to hold the scanner instance so we can stop it properly
  const scannerRef = React.useRef<any>(null);

  // Initial cleanup only
  useEffect(() => {
    if (!scanning) {
      setCameraActive(false);
      setCameras([]);
      if (scannerRef.current) {
        // Safe stop logic
        const s = scannerRef.current;
        s.stop().catch(() => { }).then(() => s.clear().catch(() => { }));
        scannerRef.current = null;
      }
    }
  }, [scanning]);

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // 1. Cleanup old instance first
      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch (e) { }
        try { await scannerRef.current.clear(); } catch (e) { }
        scannerRef.current = null;
      }

      // 2. Get Cameras (if needed)
      if (cameras.length === 0) {
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length) {
            setCameras(devices);
            if (!selectedCameraId) setSelectedCameraId(devices[devices.length - 1].id);
          }
        } catch (e) {
          console.warn("Get cameras failed", e);
        }
      }

      // 3. Start
      // Wait a tick for UI
      await new Promise(r => setTimeout(r, 100));
      if (!document.getElementById("reader")) throw new Error("Kamera view tidak ditemukan");

      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = selectedCameraId ? { deviceId: { exact: selectedCameraId } } : { facingMode: "environment" };

      await html5QrCode.start(
        config,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          console.log("Scanned:", decodedText);

          // Stop Safely
          try { await html5QrCode.stop(); } catch (e) { }
          try { await html5QrCode.clear(); } catch (e) { }
          scannerRef.current = null;

          setScanning(false);
          setCameraActive(false);

          const code = decodedText.trim();
          if (itemMode === 'single') {
            setItemForm(prev => ({ ...prev, barcode: code }));
            await handleLookup(code);
          } else {
            showToast("Scan sukses: " + code);
          }
        },
        () => { }
      );

    } catch (err: any) {
      console.error("Failed to start scanner", err);
      setCameraActive(false);

      const msg = err?.message || err?.toString() || "";
      if (msg.includes("Permission") || msg.includes("Access") || msg.includes("denied")) {
        showToast("⚠️ Kamera diblokir. Gunakan UPLOAD FOTO dibawah.", true);
      } else {
        showToast("Gagal memulai kamera: " + msg, true);
      }
    }
  };

  // Handle camera switch
  useEffect(() => {
    if (cameraActive && selectedCameraId && scannerRef.current) {
      // Restart with new camera
      const s = scannerRef.current;
      s.stop().catch(() => { }).then(() => {
        s.clear().catch(() => { });
        startCamera();
      });
    }
  }, [selectedCameraId]);

  const handleLookup = async (code: string) => {
    if (!code) return;
    showToast("Mencari data produk...");
    try {
      const res = await fetchJson(`/api/admin/items/lookup?code=${code}`);
      if (res.ok && res.data) {
        const d = res.data;
        setItemForm(prev => ({
          ...prev,
          barcode: code,
          name: d.name || prev.name,
          brand: d.brand || prev.brand,
          category: d.category || prev.category,
          size: d.size || prev.size,
          // If image found, strictly we assume user needs to upload it manually or we handle it later.
          // For now we auto-fill text fields.
        }));
        showToast("Data ditemukan: " + d.name);
      } else if (res.googleLink) {
        showToast("Data tidak ditemukan otomatis. Membuka Google...");
        window.open(res.googleLink, "_blank");
      }
    } catch (e) {
      showToast("Gagal lookup otomatis", true);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetchJson(`/api/admin/items/${deleteTarget.id}`, { method: "DELETE" });
      showToast("Item berhasil dihapus");
      setDeleteTarget(null);
      loadItems();
    } catch (e: any) {
      showToast(e.message, true);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles['premium-container']}>
        {/* Header Section */}
        <header className={styles.headerCard}>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className={styles.headerSubtitle}>Master Data Management</p>
              <h1 className={styles.headerTitle}>Inventory Items</h1>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setDropAllModalOpen(true)} className="bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 !h-12 !px-4 border-none font-bold">
                ⚠️ DROP ALL PRODUK!
              </Button>
              <Button onClick={() => {
                setItemForm({ name: "", brand: "", category: "", location: "", size: "", unit: "pcs", minStock: "0", barcode: "" });
                setEditTargetId(null);
                setItemMode("single");
                setItemFormOpen(true);
              }} className="btn-gold !h-12 !px-6">
                + Item Baru
              </Button>
              <Button onClick={() => {
                setItemForm({ name: "", brand: "", category: "", location: "", size: "", unit: "pcs", minStock: "0", barcode: "" });
                setEditTargetId(null);
                setItemMode("single");
                setItemFormOpen(true);
                // Delayed start to ensure modal render
                setTimeout(() => setScanning(true), 100);
              }} className="bg-navy/10 text-navy hover:bg-navy hover:text-white !h-12 !px-4 border border-navy/20 font-bold transition-all">
                📷 Scan & Add
              </Button>
              <Button onClick={() => router.push("/dashboard")} className="btn-primary !bg-white/10 !backdrop-blur !h-12 !px-6 border-white/20">
                Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Controls Section */}
        <div className={styles.controlBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="Cari item, brand, atau kategori..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            {(["all", "priority", "low", "empty"] as FilterOption[]).map(f => (
              <button
                key={f}
                className={`${styles.filterPill} ${filter === f ? styles.filterPillActive : ""}`}
                onClick={() => {
                  setFilter(f);
                  const q = new URLSearchParams(window.location.search);
                  q.set("filter", f);
                  router.push(`?${q.toString()}`);
                }}
              >
                {f === 'priority' ? 'Wajib Refill' : f === 'low' ? 'Stok Rendah' : f === 'empty' ? 'Habis' : 'Semua'}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.premiumTable}>
            <thead>
              <tr>
                <th>Item & Spesifikasi</th>
                <th>Lokasi Rak</th>
                <th>Status Refill</th>
                <th>Detail Stok</th>
                <th>Nilai Total</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 opacity-40 font-bold">Mengambil data dari server...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="font-bold text-navy/40 mb-4">Tidak ada item yang ditemukan.</div>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="px-6 py-2 bg-navy/5 hover:bg-navy/10 text-navy font-bold rounded-full text-sm transition-all"
                      >
                        ✕ Hapus pencarian "{search}"
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} onClick={() => router.push(`/items/${item.id}/riwayat`)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <td>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemMeta}>{item.brand} • {item.category} • {item.size}</div>
                    </td>
                    <td>
                      <span className="font-black text-navy/40 uppercase text-[11px] tracking-widest bg-navy/5 px-2 py-1 rounded-md">
                        {item.location || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${item.statusRefill === 'Aman' ? styles.statusAman :
                        item.statusRefill === 'Habis' ? styles.statusHabis : styles.statusWajib
                        }`}>
                        {item.statusRefill}
                      </span>
                    </td>
                    <td>
                      <div className={styles.stockGrid}>
                        <div className={styles.stockBox}>
                          <span className={styles.stockLabel}>Baru</span>
                          <span className={styles.stockVal}>{item.stockNew}</span>
                        </div>
                        <div className={styles.stockBox}>
                          <span className={styles.stockLabel}>Bekas</span>
                          <span className={styles.stockVal}>{item.stockUsed}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-black text-navy">{formatCurrency(item.nilaiStok)}</div>
                      <div className="text-[10px] font-bold text-navy/30 uppercase tracking-tighter">Inventory Valuation</div>
                    </td>
                    <td className="text-right">
                      <button className={styles.actionTrigger} onClick={(e) => toggleActionMenu(e, item)}>
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-navy/10 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🗑️
              </div>
              <h3 className="text-xl font-black text-navy mb-2">Hapus Item?</h3>
              <p className="text-sm text-navy/60 font-medium">
                Anda yakin ingin menghapus <strong className="text-navy">{deleteTarget.name}</strong>?
                <br />
                Tindakan ini <span className="text-red-600 font-bold">permanen</span> dan akan menghapus semua riwayat stok terkait.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-11 bg-slate-100 text-navy/70 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-11 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Menu Dropdown */}
      {actionMenu && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setActionMenu(null)} />
          <div
            className={`${styles.dropdown} animate-in fade-in slide-in-from-top-2`}
            style={{ left: actionMenu.left, top: actionMenu.top, transform: actionMenu.dir === 'up' ? 'translateY(-100%)' : 'none' }}
          >
            <button className={styles.dropdownItem} onClick={() => {
              setSelectedItem(actionMenu.item);
              setStockModalOpen(true);
              setStockSupplierQuery(actionMenu.item.name);
              setActionMenu(null);
            }}><span>➕</span> Tambah Stok</button>
            <button className={styles.dropdownItem} onClick={() => {
              router.push(`/items/${actionMenu.item.id}/riwayat`);
              setActionMenu(null);
            }}><span>📜</span> Lihat Riwayat</button>
            <button className={styles.dropdownItem} onClick={() => {
              const u = actionMenu.item;
              setItemForm({ name: u.name, brand: u.brand || "", category: u.category || "", location: u.location || "", size: u.size || "", unit: u.unit, minStock: String(u.minStock), barcode: u.barcode || "" });
              setEditTargetId(u.id);
              setItemMode("single");
              setItemFormOpen(true);
              setActionMenu(null);
            }}><span>✏️</span> Edit Detail</button>
            <div className="h-px bg-navy/5 my-1" />
            <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => {
              setDeleteTarget(actionMenu.item);
              setActionMenu(null);
            }}><span>🗑️</span> Hapus Item</button>
          </div>
        </>
      )}

      {/* Scanner Modal */}
      {scanning && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl relative">
            <button
              onClick={() => setScanning(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-navy mb-4 text-center">Scan Barcode / QR</h3>

            {/* Camera Control */}
            <div className="flex flex-col gap-3 mb-4">
              {!cameraActive ? (
                <button onClick={startCamera} className="bg-navy text-white font-bold py-3 rounded-xl shadow-lg hover:bg-navy/90 transition-all flex items-center justify-center gap-2">
                  <span>📷</span> MULAI KAMERA
                </button>
              ) : (
                <div className="flex gap-2">
                  {cameras.length > 0 && (
                    <select
                      className={styles.formInput + " !h-10 !text-xs bg-white border-gold flex-1"}
                      value={selectedCameraId}
                      onChange={(e) => setSelectedCameraId(e.target.value)}
                    >
                      {cameras.map((cam) => (
                        <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id.substr(0, 5)}...`}</option>
                      ))}
                    </select>
                  )}
                  <button onClick={() => setScanning(false)} className="px-4 bg-red-100 text-red-600 font-bold rounded-lg text-xs hover:bg-red-200">
                    STOP
                  </button>
                </div>
              )}
            </div>

            <div id="reader" className="w-full overflow-hidden rounded-xl bg-black/5 min-h-[250px]" />

            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-center text-xs text-gray-400">Arahkan kamera ke kode produk</p>
              <div className="flex items-center gap-2 w-full my-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-[10px] text-gray-300 font-bold uppercase">ATAU</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              <label className="btn-primary w-full text-center cursor-pointer text-xs py-3 rounded-lg dark:text-white mb-4 block">
                📂 Upload Foto Barcode
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const html5QrCode = new Html5Qrcode("reader");
                    html5QrCode.scanFile(file, true)
                      .then((decodedText: string) => {
                        console.log("File Scanned:", decodedText);
                        setScanning(false);
                        const code = decodedText.trim();
                        if (itemMode === 'single') {
                          setItemForm(prev => ({ ...prev, barcode: code }));
                          handleLookup(code);
                        } else {
                          showToast("Scan sukses: " + code);
                        }
                      })
                      .catch((err: any) => {
                        showToast("Gagal membaca barcode dari gambar. Pastikan gambar jelas.", true);
                      });
                  }
                }} />
              </label>

              <div className="flex items-center gap-2 w-full my-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-[10px] text-gray-300 font-bold uppercase">ATAU KETIK MANUAL</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              <div className="flex gap-2 w-full">
                <input
                  className={styles.formInput}
                  placeholder="Ketik kode disini..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) {
                        setScanning(false);
                        if (itemMode === 'single') {
                          setItemForm(prev => ({ ...prev, barcode: val }));
                          handleLookup(val);
                        } else {
                          showToast("Input sukses: " + val);
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Form Modal (With Bulk Support) */}
      {itemFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${itemMode === 'bulk' ? '!max-w-5xl' : ''}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editTargetId ? 'Edit Item' : itemMode === 'bulk' ? 'Input Barang Masuk (Bulk)' : 'Input Barang Baru'}</h2>
              <button className={styles.modalClose} onClick={() => setItemFormOpen(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {!editTargetId && (
                <div className={styles.modeToggle}>
                  <button className={`${styles.modeBtn} ${itemMode === 'single' ? styles.modeBtnActive : ''}`} onClick={() => setItemMode('single')}>Single Item</button>
                  <button className={`${styles.modeBtn} ${itemMode === 'bulk' ? styles.modeBtnActive : ''}`} onClick={() => setItemMode('bulk')}>Bulk Entry (Banyak Item)</button>
                </div>
              )}

              {/* BULK MODE UI */}
              {itemMode === 'bulk' && (
                <div className="space-y-6">
                  <div className={styles.formFull}>
                    <label className={styles.formLabel}>Pilih Supplier</label>
                    <div className={styles.searchInputWrap}>
                      <input placeholder="Cari supplier..." value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {bulkSuppliers.map(s => (
                        <button key={s.id}
                          onClick={() => setBulkSelectedSupplier({ id: s.id, name: s.name })}
                          className={`${styles.supplierBtn} ${bulkSelectedSupplier.id === s.id ? '!bg-gold !text-white' : ''}`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.bulkTableWrapper}>
                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto px-1 py-2">
                      <div className="grid grid-cols-12 gap-2 px-4 text-xs font-bold text-navy/40 uppercase tracking-wider">
                        <div className="col-span-5">Identitas Produk</div>
                        <div className="col-span-7 pl-6">Detail Stok & Lokasi</div>
                      </div>
                      {bulkItems.map((row, idx) => (
                        <div key={idx} className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 gap-3 hover:shadow-md transition-shadow relative group">
                          <button className="absolute -right-2 -top-2 w-6 h-6 bg-red-100 text-red-600 rounded-full shadow flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10 font-bold" onClick={() => {
                            const n = [...bulkItems]; n.splice(idx, 1); setBulkItems(n);
                          }}>✕</button>

                          {/* ROW 1: Identity */}
                          <div className="flex gap-3 items-center border-b border-dashed border-gray-100 pb-3">
                            <div className="w-8 flex items-center justify-center font-bold text-navy/20">{idx + 1}.</div>
                            <div className="flex-1">
                              <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Nama Produk</label>
                              <input className={styles.formInput} placeholder="Contoh: Semen Gresik 40kg" value={row.name} onChange={e => {
                                const n = [...bulkItems]; n[idx].name = e.target.value; setBulkItems(n);
                              }} />
                            </div>
                            <div className="w-1/4">
                              <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Brand</label>
                              <input className={styles.formInput} placeholder="Merk" value={row.brand} onChange={e => {
                                const n = [...bulkItems]; n[idx].brand = e.target.value; setBulkItems(n);
                              }} />
                            </div>
                            <div className="w-1/6">
                              <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Size</label>
                              <input className={styles.formInput} placeholder="Ukuran" value={row.size} onChange={e => {
                                const n = [...bulkItems]; n[idx].size = e.target.value; setBulkItems(n);
                              }} />
                            </div>
                          </div>

                          {/* ROW 2: Specs & Stock */}
                          <div className="flex gap-3 pl-8">
                            <div className="flex-1 flex gap-2">
                              <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Kategori</label>
                                <input className={styles.formInput} placeholder="Kategori" value={row.category} onChange={e => {
                                  const n = [...bulkItems]; n[idx].category = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                              <div className="w-1/3">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Rak</label>
                                <input className={styles.formInput} placeholder="Lokasi" value={row.location} onChange={e => {
                                  const n = [...bulkItems]; n[idx].location = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                            </div>

                            <div className="w-px bg-gray-100 mx-2" />

                            <div className="flex-1 flex gap-2">
                              {/* Stock Params */}
                              <div className="flex-[2] flex gap-2">
                                <div className="w-16">
                                  <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Unit</label>
                                  <input className={styles.formInput + " text-center"} placeholder="Pcs" value={row.unit} onChange={e => {
                                    const n = [...bulkItems]; n[idx].unit = e.target.value; setBulkItems(n);
                                  }} />
                                </div>
                                <div className="w-20">
                                  <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Qty</label>
                                  <input type="number" className={styles.formInput + " text-center font-bold text-navy"} placeholder="0" value={row.qty} onChange={e => {
                                    const n = [...bulkItems]; n[idx].qty = e.target.value; setBulkItems(n);
                                  }} />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Satuan</label>
                                  <select className={styles.formInput} value={row.unitQty || 'satuan'} onChange={e => {
                                    const n = [...bulkItems]; n[idx].unitQty = e.target.value; setBulkItems(n);
                                  }}>
                                    <option value="satuan">Pcs/Satuan</option>
                                    <option value="pack">Pack/Dus</option>
                                  </select>
                                </div>
                                {row.unitQty === 'pack' && (
                                  <div className="w-16">
                                    <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Isi</label>
                                    <input type="number" className={styles.formInput + " text-center"} placeholder="1" value={row.isiPerPack} onChange={e => {
                                      const n = [...bulkItems]; n[idx].isiPerPack = e.target.value; setBulkItems(n);
                                    }} />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Harga Beli</label>
                                <input type="number" className={styles.formInput} placeholder="Rp" value={row.harga} onChange={e => {
                                  const n = [...bulkItems]; n[idx].harga = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                              <div className="w-16">
                                <label className="text-[10px] uppercase font-bold text-navy/40 mb-1 block">Min.</label>
                                <input type="number" className={styles.formInput + " text-center"} placeholder="0" value={row.minStock} onChange={e => {
                                  const n = [...bulkItems]; n[idx].minStock = e.target.value; setBulkItems(n);
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="m-4 !h-8 !text-xs" onClick={() => setBulkItems([...bulkItems, { name: "", brand: "", category: "", location: "", size: "", unit: "pcs", unitQty: "satuan", isiPerPack: "", priceType: "per_satuan", minStock: "0", qty: "", harga: "", supplierId: 0, supplierName: "" }])}>+ Tambah Baris</Button>
                  </div>
                </div>
              )}

              {/* SINGLE MODE UI */}
              {itemMode === 'single' && (<>
                <div className={styles.formGrid}>
                  <div className={styles.formFull}>
                    <label className={styles.formLabel}>Barcode / QR Code</label>
                    <div className="flex gap-2">
                      <input
                        className={styles.formInput}
                        value={(itemForm as any).barcode || ""}
                        onChange={e => setItemForm({ ...itemForm, barcode: e.target.value } as any)}
                        placeholder="Scan atau ketik kode..."
                        onBlur={(e) => {
                          if (e.target.value.length > 5) handleLookup(e.target.value);
                        }}
                      />
                      <button
                        className="px-4 bg-navy text-white rounded-lg font-bold hover:bg-navy/80 flex items-center gap-2"
                        onClick={() => setScanning(true)}
                      >
                        <span>📷</span> Scan
                      </button>
                    </div>
                  </div>
                  <div className={styles.formFull}>
                    <label className={styles.formLabel}>Nama Lengkap Barang</label>
                    <input className={styles.formInput} value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Brand / Merk</label>
                    <input className={styles.formInput} value={itemForm.brand} onChange={e => setItemForm({ ...itemForm, brand: e.target.value })} />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Kategori</label>
                    <input className={styles.formInput} value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Dimensi / Ukuran</label>
                    <input className={styles.formInput} value={itemForm.size} onChange={e => setItemForm({ ...itemForm, size: e.target.value })} />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Unit Satuan</label>
                    <input className={styles.formInput} value={itemForm.unit} onChange={e => setItemForm({ ...itemForm, unit: e.target.value })} />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Lokasi Rak</label>
                    <input className={styles.formInput} value={itemForm.location} onChange={e => setItemForm({ ...itemForm, location: e.target.value })} />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Minimum Stok (Alert)</label>
                    <input className={styles.formInput} type="number" value={itemForm.minStock} onChange={e => setItemForm({ ...itemForm, minStock: e.target.value })} />
                  </div>
                </div>

                {/* SINGLE MODE: Optional Initial Stock */}
                {!editTargetId && (
                  <div className="mt-6 border-t border-dashed border-navy/10 pt-6">
                    <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                      📦 Stok Awal (Opsional)
                    </h3>
                    <div className={styles.formFull}>
                      <label className={styles.formLabel}>Supplier</label>
                      <SmartSupplierInput
                        value={singleSelectedSupplier.name || ""}
                        onChange={(val) => {
                          setSingleSelectedSupplier(prev => ({ ...prev, name: val }));
                          setStockSupplierQuery(val);
                        }}
                        onSelect={(id, name) => setSingleSelectedSupplier({ id, name })}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className={styles.formLabel}>Qty Awal</label>
                        <input type="number" className={styles.formInput} value={stockForm.qty} onChange={e => setStockForm({ ...stockForm, qty: e.target.value })} placeholder="0" />
                      </div>
                      <div>
                        <label className={styles.formLabel}>Satuan</label>
                        <select className={styles.formInput} value={stockForm.unitQty} onChange={e => setStockForm({ ...stockForm, unitQty: e.target.value as any })}>
                          <option value="satuan">Pcs/Satuan</option>
                          <option value="pack">Pack/Dus</option>
                        </select>
                      </div>

                      {stockForm.unitQty === 'pack' && (
                        <div>
                          <label className={styles.formLabel}>Isi per Pack</label>
                          <input type="number" className={styles.formInput} value={stockForm.isiPerPack} onChange={e => setStockForm({ ...stockForm, isiPerPack: e.target.value })} placeholder="1" />
                        </div>
                      )}

                      <div>
                        <label className={styles.formLabel}>Harga Beli</label>
                        <input type="number" className={styles.formInput} value={stockForm.harga} onChange={e => setStockForm({ ...stockForm, priceType: 'per_satuan', harga: e.target.value })} placeholder="Rp /pcs" />
                      </div>
                    </div>
                  </div>
                )}
              </>)}

              <div className="mt-8">
                <Button onClick={handleItemSubmit} className="btn-gold w-full !h-14 shadow-xl">
                  {itemMode === 'bulk' ? 'PROSES BULK ITEMS' : 'SIMPAN DATA'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
      }

      {/* Stock Modal (With Suppliers) */}
      {
        stockModalOpen && selectedItem && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Stock Adjust: {selectedItem.name}</h2>
                <button className={styles.modalClose} onClick={() => setStockModalOpen(false)}>✕</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  {/* Mode Toggle */}
                  <div className={styles.formFull}>
                    <div className="flex gap-2 bg-navy/5 p-1 rounded-xl mb-4">
                      {["baru", "bekas"].map(m => (
                        <button key={m} onClick={() => setStockForm({ ...stockForm, mode: m as any })}
                          className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase ${stockForm.mode === m ? 'bg-white shadow text-navy' : 'text-navy/40'}`}>
                          Stok {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Supplier Selection for New Stock */}
                  {stockForm.mode === 'baru' && (
                    <div className={styles.formFull}>
                      <label className={styles.formLabel}>Supplier</label>
                      <div className={styles.searchInputWrap}>
                        <input placeholder="Cari supplier..." value={stockSupplierQuery} onChange={e => setStockSupplierQuery(e.target.value)} />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {stockSuppliers.slice(0, 4).map(s => (
                          <button key={s.id} onClick={() => {
                            setSelectedStockSupplier({ id: s.id, name: s.name });
                            setStockSupplierQuery(s.name);
                          }} className={`whitespace-nowrap ${styles.supplierBtn} ${selectedStockSupplier.id === s.id ? '!bg-gold !text-white' : ''}`}>
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={styles.formLabel}>Jumlah (Qty)</label>
                    <input className={styles.formInput} type="number" value={stockForm.qty} onChange={e => setStockForm({ ...stockForm, qty: e.target.value })} />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Unit Satuan</label>
                    <select className={styles.formInput} value={stockForm.unitQty} onChange={e => setStockForm({ ...stockForm, unitQty: e.target.value as any })}>
                      <option value="satuan">Satuan ({selectedItem.unit})</option>
                      <option value="pack">Pack / Box</option>
                    </select>
                  </div>
                  {stockForm.unitQty === 'pack' && (
                    <div className={styles.formFull}>
                      <label className={styles.formLabel}>Isi Per Pack</label>
                      <input className={styles.formInput} type="number" value={stockForm.isiPerPack} onChange={e => setStockForm({ ...stockForm, isiPerPack: e.target.value })} />
                    </div>
                  )}
                  {stockForm.mode === 'baru' && (
                    <div className={styles.formFull}>
                      <label className={styles.formLabel}>Harga Beli (Satuan)</label>
                      <input className={styles.formInput} type="number" value={stockForm.harga} onChange={e => setStockForm({ ...stockForm, harga: e.target.value })} />
                    </div>
                  )}
                </div>
                <div className="mt-8">
                  <Button onClick={handleStockSubmit} className="btn-primary w-full !h-14 shadow-xl">SIMPAN PERUBAHAN STOK</Button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Drop All Modal */}
      {
        dropAllModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent + " !max-w-md"}>
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⚠️</div>
                <h3 className="text-xl font-black text-navy mb-2">Hapus SEMUA Item?</h3>
                <p className="text-sm text-navy/60 mb-6">
                  Tindakan ini akan menghapus <strong>seluruh database inventory</strong> dan history stok. Masukkan password admin untuk konfirmasi.
                </p>
                <div className="mb-6">
                  <input
                    type="password"
                    placeholder="Password Admin..."
                    className={styles.formInput + " text-center"}
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <button className="flex-1 h-12 rounded-xl font-bold bg-gray-100" onClick={() => {
                    setDropAllModalOpen(false);
                    setSearch(""); // Refresh/Clear search on cancel as requested
                    loadItems();
                  }}>BATAL</button>
                  <button className="flex-1 h-12 rounded-xl font-bold bg-red-600 text-white shadow-lg shadow-red-600/30" onClick={handleDropAll}>
                    {loading ? "MENGHAPUS..." : "HAPUS SEMUA"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete/Error Toasts & Modals... (Standard) */}
      {
        deleteTarget && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent + " !max-w-md"}>
              <div className="p-8 text-center">
                <h3 className="text-xl font-black text-navy mb-2">Hapus Item?</h3>
                <p className="text-sm text-navy/60 mb-8">Yakin hapus {deleteTarget.name}?</p>
                <div className="flex gap-4">
                  <button className="flex-1 h-12 rounded-xl font-bold bg-gray-100" onClick={() => setDeleteTarget(null)}>BATAL</button>
                  <button className="flex-1 h-12 rounded-xl font-bold bg-red-50 text-red-600 border border-red-200" onClick={handleDelete}>HAPUS</button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      <div className={`${styles.toast} ${toast.visible ? styles.toastVisible : ""} ${toast.error ? styles.toastError : ""}`}>
        {toast.msg}
      </div>
    </div >
  );
}

export default function AdminItemsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent"></div>
          <p className="text-xs font-bold text-navy/50 uppercase tracking-widest">Memuat Inventory...</p>
        </div>
      </div>
    }>
      <AdminItemsContent />
    </Suspense>
  );
}
