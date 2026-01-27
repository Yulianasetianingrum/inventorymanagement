"use client";

import React, { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./items.module.css";
import { Button } from "@/components/ui/button";
import BarcodeScanner from "@/components/BarcodeScanner";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!value || value.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
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
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="relative w-full">
      <input
        className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm font-bold text-navy placeholder:text-slate-400 focus:border-navy focus:ring-4 focus:ring-navy/10 transition-all shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onSelect(null, e.target.value); // Reset ID, keep name implies potential new supplier
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
      />
      {show && value.length > 1 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 shadow-lg rounded-md mt-1 max-h-40 overflow-y-auto">
          {loading && <div className="p-2 text-xs text-gray-400 text-center">Mencari...</div>}

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

          {!loading && (
            <button
              className="w-full text-left px-3 py-2 text-xs hover:bg-gold/10 bg-gold/5 text-navy font-bold flex items-center gap-2"
              onClick={() => {
                // Confirm creation via typing
                onSelect(null, value);
                setShow(false);
              }}
            >
              <span>➕</span> Buat Supplier Baru: "{value}"
            </button>
          )}
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
  const [bulkSelectedSupplier, setBulkSelectedSupplier] = useState<{ id: number | null, name: string }>({ id: null, name: "" });

  // BULK SCANNER STATE
  const [bulkBarcode, setBulkBarcode] = useState("");

  const handleBulkScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkBarcode.trim()) return;

    const code = bulkBarcode.trim();

    // 1. Search in Loaded Items (Local DB Context)
    const existing = items.find(i => i.barcode === code || i.id.toString() === code);

    // 2. Check if already in current bulk list to Merge/Increment vs Add New Line
    // User requested "tiap di scan itu fill barcode otomatis".
    // If user wants to scan 10 times to add 10 qty, we can stick to increment logic OR add mostly duplicate rows.
    // The previous logic was "Increment Qty". We'll keep that as it's efficient.
    const existingRowIndex = bulkItems.findIndex(r => r.barcode === code);

    if (existingRowIndex >= 0) {
      // Increment existing row
      const newItems = [...bulkItems];
      const currentQty = parseInt(newItems[existingRowIndex].qty) || 0;
      newItems[existingRowIndex].qty = (currentQty + 1).toString();
      setBulkItems(newItems);
      showToast(`Qty item ditambahkan (+1)`, false);
    } else if (existing) {
      // Auto-Fill from DB
      setBulkItems(prev => [...prev, {
        name: existing.name,
        brand: existing.brand || "",
        category: existing.category || "",
        location: existing.location || "",
        size: existing.size || "",
        unit: existing.unit || "pcs",
        unitQty: "satuan",
        isiPerPack: existing.unit === 'pack' ? "10" : "1",
        priceType: "per_satuan",
        minStock: existing.minStock?.toString() || "0",
        qty: "1",
        harga: "",
        supplierId: 0,
        supplierName: "",
        barcode: code // Fill Barcode
      }]);
      showToast(`Item "${existing.name}" ditemukan & ditambahkan`, false);
    } else {
      // New Item - Fill Barcode Only
      setBulkItems(prev => [...prev, {
        name: "",
        brand: "",
        category: "",
        location: "",
        size: "",
        unit: "pcs",
        unitQty: "satuan",
        isiPerPack: "",
        priceType: "per_satuan",
        minStock: "0",
        qty: "1",
        harga: "",
        supplierId: 0,
        supplierName: "",
        barcode: code // Fill Barcode
      }]);
      showToast(`Item baru (Barcode: ${code}) ditambahkan`, false);
    }
    setBulkBarcode("");
  };

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
      if (!bulkSelectedSupplier.id && !bulkSelectedSupplier.name) return showToast("Pilih supplier atau ketik nama baru untuk batch ini", true);

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
                supplierId: bulkSelectedSupplier.id,
                supplierName: bulkSelectedSupplier.name
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


  /* --- REFACTORED SCANNER LOGIC --- */

  const handleScanSuccess = async (decodedText: string) => {
    console.log("Scan Success:", decodedText);
    const code = decodedText.trim();

    // Stop scanning immediately after successful scan
    setScanning(false);
    setCameraActive(false);

    if (itemMode === 'single') {
      setItemForm(prev => ({ ...prev, barcode: code }));
      await handleLookup(code);
    } else {
      showToast("Scan sukses: " + code);
    }
  };


  const handleLookup = async (code: string) => {
    if (!code) return;
    showToast("Mencari data produk...");
    try {
      const res = await fetchJson(`/api/admin/items/lookup?code=${code}`);
      if (res.ok && res.data) {
        const d = res.data;

        // If found in LocalDB, switch to STOCK IN mode
        if (res.source === "LocalDB" && d.id) {
          // Set selected item for stock modal
          const itemData = {
            id: d.id,
            name: d.name,
            brand: d.brand,
            category: d.category,
            size: d.size,
            unit: d.unit,
            stockNew: d.stockNew ?? 0,
            stockUsed: d.stockUsed ?? 0,
            stockTotal: (d.stockNew ?? 0) + (d.stockUsed ?? 0),
            // other fields not strictly needed for stock modal but good for completeness
            location: d.location,
            minStock: d.minStock ?? 0,
            statusRefill: "Aman", // dummy val
            nilaiStok: 0, // dummy
            updatedAt: "",
          } as ItemRow;

          setSelectedItem(itemData);
          setStockModalOpen(true); // Open stock modal instead of edit form
          setStockSupplierQuery(""); // Fix: Don't pre-fill supplier with item name

          showToast(`Item terdaftar: ${d.name}. Mode Tambah Stok aktif.`, false);
          return; // Stop here, don't open item form
        } else if (res.source !== "Placeholder") {
          showToast("Data ditemukan di internet: " + d.name);
          setItemFormOpen(true); // Open form for new item
        } else {
          showToast("✓ Mode Manual Aktif. Silakan lengkapi nama.");
          setItemFormOpen(true); // Open form for new item
        }

        setItemForm({
          barcode: code,
          name: d.name || "",
          brand: d.brand || "",
          category: d.category || "",
          location: d.location || "",
          size: d.size || "",
          unit: d.unit || "pcs",
          minStock: String(d.minStock ?? 0)
        });
      }
    } catch (e) {
      showToast("Gagal lookup otomatis. Mode Input Manual.", true);
      setItemForm(prev => ({
        ...prev,
        barcode: code,
        ...(!editTargetId ? { name: `Item ${code}` } : {})
      }));
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
          <div className="flex flex-col md:flex-row justify-between items-start relative z-10 gap-6">
            <div>
              <p className={styles.headerSubtitle}>Master Data Management</p>
              <h1 className={styles.headerTitle}>Inventory Items</h1>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-3 w-full md:w-auto">
              {/* Drop All - Full Width on Mobile */}
              <Button onClick={() => setDropAllModalOpen(true)} className="col-span-2 sm:col-span-1 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 !h-12 !px-4 border-none font-bold">
                DROP ALL
              </Button>
              <Button onClick={() => {
                setItemForm({ name: "", brand: "", category: "", location: "", size: "", unit: "pcs", minStock: "0", barcode: "" });
                setEditTargetId(null);
                setItemMode("single");
                setItemFormOpen(true);
              }} className="btn-gold !h-12 !px-6">
                + Baru
              </Button>
              <Button onClick={() => {
                setItemForm({ name: "", brand: "", category: "", location: "", size: "", unit: "pcs", minStock: "0", barcode: "" });
                setEditTargetId(null);
                setItemMode("single");
                setItemFormOpen(true);
                // Delayed start to ensure modal render
                setTimeout(() => setScanning(true), 100);
              }} className="bg-navy/10 text-navy hover:bg-navy hover:text-white !h-12 !px-4 border border-navy/20 font-bold transition-all">
                Scan
              </Button>
              <Button onClick={() => router.push("/dashboard")} className="col-span-2 sm:col-span-1 btn-primary !bg-white/10 !backdrop-blur !h-12 !px-6 border-white/20">
                Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-4 mb-6 md:mb-8">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              className="w-full h-12 md:h-14 pl-12 pr-6 bg-white border border-gray-100 rounded-2xl font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/5 shadow-sm transition-all text-sm"
              placeholder="Cari item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {(["all", "priority", "low", "empty"] as FilterOption[]).map(f => (
              <button
                key={f}
                className={`h-10 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${filter === f
                  ? "bg-navy text-white shadow-lg shadow-navy/20"
                  : "bg-white text-navy/40 hover:text-navy border border-gray-100"
                  }`}
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

        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden md:block bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
          <table className={styles.premiumTable}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Item & Spesifikasi</th>
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Barcode</th>
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Lokasi Rak</th>
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Status Refill</th>
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Detail Stok</th>
                <th className="px-6 py-5 text-left text-xs font-black text-navy/40 uppercase tracking-widest">Nilai Total</th>
                <th className="px-6 py-5 text-right text-xs font-black text-navy/40 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 font-bold opacity-30 text-navy">Mengambil data dari server...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 font-bold opacity-30 text-navy">
                    <div className="mb-4">Tidak ada item yang ditemukan.</div>
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
                  <tr key={item.id} onClick={() => router.push(`/items/${item.id}/riwayat`)} className="cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-navy text-base">{item.name}</div>
                      <div className="text-xs font-semibold text-navy/40 mt-1">{item.brand} • {item.category} • {item.size}</div>
                    </td>
                    <td className="px-6 py-5">
                      <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-[11px] font-bold">
                        {item.barcode || "-"}
                      </code>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-black text-navy/40 uppercase text-[11px] tracking-widest bg-navy/5 px-2 py-1 rounded-md">
                        {item.location || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${item.statusRefill === 'Aman' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        item.statusRefill === 'Habis' ? "bg-red-50 text-red-600 border-red-100" :
                          "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                        {item.statusRefill}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-4">
                        <div>
                          <span className="block text-[10px] text-navy/30 font-bold uppercase">Baru</span>
                          <span className="font-bold text-navy">{item.stockNew}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-navy/30 font-bold uppercase">Bekas</span>
                          <span className="font-bold text-navy">{item.stockUsed}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-navy">{formatCurrency(item.nilaiStok)}</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="w-8 h-8 rounded-full hover:bg-navy/5 flex items-center justify-center text-navy/40 hover:text-navy transition-colors ml-auto" onClick={(e) => toggleActionMenu(e, item)}>
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="text-center py-20 font-bold opacity-30 text-navy">Mengambil data dari server...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 font-bold opacity-30 text-navy">
              <div className="mb-4">Tidak ada item yang ditemukan.</div>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="px-6 py-2 bg-navy/5 hover:bg-navy/10 text-navy font-bold rounded-full text-sm transition-all"
                >
                  ✕ Hapus pencarian "{search}"
                </button>
              )}
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-transform"
                onClick={() => router.push(`/items/${item.id}/riwayat`)}
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${item.statusRefill === 'Aman' ? "bg-emerald-500" :
                  item.statusRefill === 'Habis' ? "bg-red-500" : "bg-amber-500"
                  }`}></div>

                <div className="flex justify-between items-start pl-3 mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-navy text-lg leading-tight mb-1">{item.name}</h3>
                    <div className="text-xs font-semibold text-navy/40">{item.brand} • {item.size}</div>
                  </div>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-navy/40 hover:bg-slate-100 hover:text-navy"
                    onClick={(e) => toggleActionMenu(e, item)}
                  >
                    ⋮
                  </button>
                </div>

                <div className="pl-3 grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="block text-[10px] text-navy/40 font-bold uppercase tracking-widest mb-1">Total Stok</span>
                    <div className="text-xl font-black text-navy">{item.stockTotal} <span className="text-xs font-bold text-navy/40">{item.unit}</span></div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="block text-[10px] text-navy/40 font-bold uppercase tracking-widest mb-1">Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${item.statusRefill === 'Aman' ? "text-emerald-600 bg-emerald-100/50" :
                      item.statusRefill === 'Habis' ? "text-red-600 bg-red-100/50" : "text-amber-600 bg-amber-100/50"
                      }`}>
                      {item.statusRefill}
                    </span>
                  </div>
                </div>

                <div className="pl-3 flex justify-between items-center pt-3 border-t border-slate-50">
                  <div className="text-xs font-bold text-navy/40">
                    <span className="mr-2">📍 {item.location || "-"}</span>
                  </div>
                  <div className="text-xs font-black text-navy">
                    {formatCurrency(item.nilaiStok)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-navy/10 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                !
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
            className="fixed z-[999] bg-white rounded-xl shadow-2xl border border-navy/5 p-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-0.5"
            style={{ left: actionMenu.left, top: actionMenu.top, transform: actionMenu.dir === 'up' ? 'translateY(-100%)' : 'none' }}
          >
            <button className="w-full text-left px-4 py-3 rounded-lg text-xs font-bold text-navy hover:bg-navy/5 transition-colors flex items-center gap-3" onClick={() => {
              setSelectedItem(actionMenu.item);
              setStockModalOpen(true);
              setStockSupplierQuery("");
              setActionMenu(null);
            }}><span className="text-gold text-sm">✚</span> Tambah Stok</button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-xs font-bold text-navy hover:bg-navy/5 transition-colors flex items-center gap-3" onClick={() => {
              router.push(`/items/${actionMenu.item.id}/riwayat`);
              setActionMenu(null);
            }}><span className="text-navy/40 text-sm">●</span> Lihat Riwayat</button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-xs font-bold text-navy hover:bg-navy/5 transition-colors flex items-center gap-3" onClick={() => {
              const u = actionMenu.item;
              setItemForm({ name: u.name, brand: u.brand || "", category: u.category || "", location: u.location || "", size: u.size || "", unit: u.unit, minStock: String(u.minStock), barcode: u.barcode || "" });
              setEditTargetId(u.id);
              setItemMode("single");
              setItemFormOpen(true);
              setActionMenu(null);
            }}><span className="text-navy/40 text-sm">✎</span> Edit Detail</button>
            <div className="h-px bg-gray-100 my-1" />
            <button className="w-full text-left px-4 py-3 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-3" onClick={() => {
              setDeleteTarget(actionMenu.item);
              setActionMenu(null);
            }}><span className="text-sm">✕</span> Hapus Item</button>
          </div>
        </>
      )
      }

      {/* Scanner Modal */}
      {
        scanning && (
          <div className={styles.modalOverlay} style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md md:max-w-3xl mx-4 my-8 shadow-2xl relative overflow-y-auto flex flex-col max-h-[90vh]">
              <button
                onClick={() => setScanning(false)}
                className="absolute top-2 right-2 z-[100] bg-white rounded-full p-2 shadow-lg border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 font-bold transition-all"
              >
                ✕
              </button>
              <h3 className="text-lg font-black text-navy mb-4 text-center">Scan Barcode / QR</h3>


              {/* Camera Control - Replaced with BarcodeScanner Component */}
              <div className="mb-4">
                <BarcodeScanner
                  onScanSuccess={handleScanSuccess}
                  onScanFailure={(err) => {
                    // Optional: Log benign errors or just ignore as they happen every frame
                  }}
                />
              </div>

              {/* Hidden reader element for file scan */}
              <div id="reader" className="hidden" />

              <div className="mt-4 flex flex-col items-center gap-2">
                <p className="text-center text-xs text-gray-400">Arahkan kamera ke kode produk</p>
                <div className="flex items-center gap-2 w-full my-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-[10px] text-gray-300 font-bold uppercase">ATAU</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <label className="btn-primary w-full text-center cursor-pointer text-xs py-3 rounded-lg dark:text-white mb-4 block">
                  Upload Foto Barcode
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
        )
      }

      {/* Item Form Modal (With Bulk Support) */}
      {
        itemFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`bg-white rounded-3xl shadow-2xl w-full flex flex-col max-h-[90vh] overflow-hidden ${itemMode === 'bulk' ? 'max-w-6xl' : 'max-w-2xl'} animate-in zoom-in-95 duration-200`}>

              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-navy tracking-tight">{editTargetId ? 'Edit Item' : itemMode === 'bulk' ? 'Input Barang Masuk' : 'Input Barang Baru'}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Management Inventory</p>
                </div>
                <button
                  onClick={() => setItemFormOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                {!editTargetId && (
                  <div className="flex bg-gray-100/50 p-1.5 rounded-xl mb-8 w-fit mx-auto border border-gray-100">
                    <button
                      className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${itemMode === 'single' ? 'bg-white text-navy shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-navy'}`}
                      onClick={() => setItemMode('single')}
                    >
                      Single Item
                    </button>
                    <button
                      className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${itemMode === 'bulk' ? 'bg-white text-navy shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-navy'}`}
                      onClick={() => setItemMode('bulk')}
                    >
                      Bulk Entry
                    </button>
                  </div>
                )}

                {/* BULK MODE UI */}
                {itemMode === 'bulk' && (
                  <div className="space-y-8">
                    <div className="bg-navy/5 p-6 rounded-2xl border border-navy/5">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-3">Supplier Batch Ini</label>
                      <div className="relative z-20"> {/* z-20 for dropdown */}
                        <SmartSupplierInput
                          value={bulkSelectedSupplier.name || ""}
                          onChange={(val) => {
                            setBulkSelectedSupplier(prev => ({ ...prev, name: val }));
                            // Also update the search query for the chips below if needed, or just let SmartInput handle it
                            setSupplierSearch(val);
                          }}
                          onSelect={(id, name) => setBulkSelectedSupplier({ id, name })}
                          placeholder="Cari atau ketik nama supplier..."
                        />
                      </div>
                      {/* Optional: Quick Chips for Frequent Suppliers (Top 5?) */}
                      {bulkSuppliers.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-4">
                          <span className="text-[10px] font-black text-slate-400 py-2 uppercase tracking-widest">Saran:</span>
                          {bulkSuppliers.slice(0, 5).map(s => (
                            <button key={s.id}
                              onClick={() => {
                                setBulkSelectedSupplier({ id: s.id, name: s.name });
                                setSupplierSearch(s.name); // update text
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border-2 transition-all shadow-sm ${bulkSelectedSupplier.id === s.id
                                ? 'bg-navy border-navy text-white shadow-navy/30 scale-105'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-navy hover:text-navy hover:bg-slate-50'
                                }`}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Use a form for Enter key support */}
                    <form onSubmit={handleBulkScan} className="mb-6 bg-white p-4 rounded-2xl border border-navy/10 shadow-sm flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-2">Barcode / QR Code (Mode Kasir)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📷</span>
                          <input
                            autoFocus
                            className="w-full h-12 bg-slate-50 border-2 border-slate-200 rounded-xl pl-12 pr-4 text-sm font-bold text-navy placeholder:text-gray-400 focus:bg-white focus:border-navy focus:ring-4 focus:ring-navy/10 transition-all"
                            placeholder="Scan atau ketik kode..."
                            value={bulkBarcode}
                            onChange={e => setBulkBarcode(e.target.value)}
                          />
                        </div>
                      </div>
                      <button type="submit" className="h-12 px-8 bg-navy text-white font-black rounded-xl hover:bg-navy/90 transition-all shadow-lg shadow-navy/20 self-end">
                        SCAN
                      </button>
                    </form>

                    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {/* Bulk Header - Desktop Only */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-6 py-4">
                          <div className="col-span-1 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">#</div>
                          <div className="col-span-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identitas Produk</div>
                          <div className="col-span-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori & Lokasi</div>
                          <div className="col-span-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stok & Harga</div>
                        </div>

                        {bulkItems.map((row, idx) => (
                          <div key={idx} className="group border-b border-gray-100 last:border-0 p-4 lg:p-6 hover:bg-slate-50 transition-colors relative">
                            {/* Desktop: Remove Button Overlay */}
                            <button
                              onClick={() => { const n = [...bulkItems]; n.splice(idx, 1); setBulkItems(n); }}
                              className="absolute right-2 top-2 lg:right-4 lg:top-1/2 lg:-translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm z-20"
                              title="Hapus Baris"
                            >✕</button>

                            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 relative z-10">

                              {/* Mobile Row Header */}
                              <div className="flex justify-between items-center lg:hidden mb-2">
                                <span className="bg-navy text-white text-xs font-bold px-2 py-1 rounded-md">Item #{idx + 1}</span>
                              </div>

                              {/* Number (Desktop) */}
                              <div className="hidden lg:flex col-span-1 items-start justify-center pt-2">
                                <span className="text-sm font-bold text-gray-300 w-6 text-center">{idx + 1}</span>
                              </div>

                              {/* Section 1: ID */}
                              <div className="col-span-4 space-y-3">
                                {/* Barcode Field (New) */}
                                <div>
                                  <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Barcode / SKU</label>
                                  <input
                                    className="w-full h-9 bg-slate-50 border border-gray-200 rounded-lg px-3 text-xs font-mono font-bold text-slate-600 focus:bg-white focus:border-navy/20 focus:outline-none"
                                    placeholder="Barcode"
                                    value={row.barcode || ""}
                                    onChange={e => { const n = [...bulkItems]; n[idx].barcode = e.target.value; setBulkItems(n); }}
                                  />
                                </div>

                                <div>
                                  <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nama Produk</label>
                                  <input
                                    className="w-full h-10 bg-white border border-gray-200 rounded-lg px-3 text-sm font-bold text-navy placeholder:text-gray-300 focus:border-navy/20 focus:outline-none focus:ring-2 focus:ring-navy/5 transition-all"
                                    placeholder="Nama Produk"
                                    value={row.name}
                                    onChange={e => { const n = [...bulkItems]; n[idx].name = e.target.value; setBulkItems(n); }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Brand</label>
                                    <input className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs font-semibold placeholder:text-gray-300 focus:bg-white focus:border-navy/20 focus:outline-none" placeholder="Brand" value={row.brand} onChange={e => { const n = [...bulkItems]; n[idx].brand = e.target.value; setBulkItems(n); }} />
                                  </div>
                                  <div>
                                    <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Ukuran</label>
                                    <input className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs font-semibold placeholder:text-gray-300 focus:bg-white focus:border-navy/20 focus:outline-none" placeholder="Ukuran" value={row.size} onChange={e => { const n = [...bulkItems]; n[idx].size = e.target.value; setBulkItems(n); }} />
                                  </div>
                                </div>
                              </div>

                              {/* Section 2: Details */}
                              <div className="col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3">
                                <div>
                                  <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Kategori</label>
                                  <input className="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-xs font-semibold placeholder:text-gray-300 focus:border-navy/20 focus:outline-none" placeholder="Kategori" value={row.category} onChange={e => { const n = [...bulkItems]; n[idx].category = e.target.value; setBulkItems(n); }} />
                                </div>
                                <div>
                                  <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Lokasi</label>
                                  <input className="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-xs font-semibold placeholder:text-gray-300 focus:border-navy/20 focus:outline-none" placeholder="Lokasi Rak" value={row.location} onChange={e => { const n = [...bulkItems]; n[idx].location = e.target.value; setBulkItems(n); }} />
                                </div>
                              </div>

                              {/* Section 3: Stock */}
                              <div className="col-span-4 space-y-3 lg:border-l lg:border-dashed lg:border-gray-200 lg:pl-6">
                                <div className="flex gap-2">
                                  <div className="w-1/3">
                                    <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Unit</label>
                                    <input className="w-full h-9 text-center bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase placeholder:text-gray-300 focus:border-navy/20 focus:outline-none" placeholder="PCS" value={row.unit} onChange={e => { const n = [...bulkItems]; n[idx].unit = e.target.value; setBulkItems(n); }} />
                                  </div>
                                  <div className="flex-1">
                                    <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Qty</label>
                                    <input type="number" className="w-full h-9 bg-blue-50/50 border border-blue-100 text-blue-800 rounded-lg px-3 text-xs font-bold focus:border-blue-300 focus:outline-none" placeholder="Qty" value={row.qty} onChange={e => { const n = [...bulkItems]; n[idx].qty = e.target.value; setBulkItems(n); }} />
                                  </div>
                                  <div className="flex-1">
                                    <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Jenis</label>
                                    <select className="w-full h-9 bg-white border border-gray-200 rounded-lg text-xs font-semibold px-2 focus:border-navy/20 focus:outline-none" value={row.unitQty || 'satuan'} onChange={e => { const n = [...bulkItems]; n[idx].unitQty = e.target.value; setBulkItems(n); }}>
                                      <option value="satuan">Unit</option>
                                      <option value="pack">Pack</option>
                                    </select>
                                  </div>
                                </div>

                                {row.unitQty === 'pack' && (
                                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Isi per Pack:</span>
                                    <input type="number" className="w-16 h-7 text-center text-xs font-bold bg-white border border-amber-200 rounded" placeholder="1" value={row.isiPerPack} onChange={e => { const n = [...bulkItems]; n[idx].isiPerPack = e.target.value; setBulkItems(n); }} />
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <div className="flex-[2]">
                                    <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Harga Beli</label>
                                    <input type="number" className="w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-xs font-semibold placeholder:text-gray-300 focus:border-navy/20 focus:outline-none" placeholder="Harga Beli" value={row.harga} onChange={e => { const n = [...bulkItems]; n[idx].harga = e.target.value; setBulkItems(n); }} />
                                  </div>
                                  <div className="flex-1">
                                    <label className="lg:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Min Stock</label>
                                    <input type="number" className="w-full h-9 text-center bg-white border border-gray-200 rounded-lg text-xs font-semibold text-red-500 placeholder:text-gray-300 focus:border-navy/20 focus:outline-none" placeholder="Min" value={row.minStock} onChange={e => { const n = [...bulkItems]; n[idx].minStock = e.target.value; setBulkItems(n); }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <button className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-400 hover:text-navy hover:border-navy/30 hover:bg-white transition-all uppercase tracking-wide flex items-center justify-center gap-2" onClick={() => setBulkItems([...bulkItems, { name: "", brand: "", category: "", location: "", size: "", unit: "pcs", unitQty: "satuan", isiPerPack: "", priceType: "per_satuan", minStock: "0", qty: "", harga: "", supplierId: 0, supplierName: "" }])}>
                          <span>+</span> Tambah Baris Baru
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SINGLE MODE UI */}
                {itemMode === 'single' && (<>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-navy uppercase tracking-widest mb-1.5 block">Barcode / QR Code</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            className="w-full h-11 bg-white border border-navy/10 rounded-xl px-4 pl-11 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                            value={(itemForm as any).barcode || ""}
                            onChange={e => setItemForm({ ...itemForm, barcode: e.target.value } as any)}
                            placeholder="Scan atau ketik kode..."
                            onBlur={(e) => {
                              if (e.target.value.length > 5) handleLookup(e.target.value);
                            }}
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg grayscale opacity-50">📷</span>
                        </div>
                        <button
                          className="px-6 h-11 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 shadow-lg shadow-navy/20 transition-all active:scale-95"
                          onClick={() => setScanning(true)}
                        >
                          SCAN
                        </button>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-navy uppercase tracking-widest mb-1.5 block">Nama Lengkap Barang</label>
                      <input
                        className="w-full h-11 bg-off-white border-transparent focus:bg-white border focus:border-navy/10 rounded-xl px-4 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        value={itemForm.name}
                        onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                        placeholder="Contoh: Lampu LED Philips 14W Putih"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-navy uppercase tracking-widest mb-1.5 block">Brand</label>
                      <input
                        className="w-full h-11 bg-off-white border-transparent focus:bg-white border focus:border-navy/10 rounded-xl px-4 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        value={itemForm.brand}
                        onChange={e => setItemForm({ ...itemForm, brand: e.target.value })}
                        placeholder="Merk"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-navy uppercase tracking-widest mb-1.5 block">Kategori</label>
                      <input
                        className="w-full h-11 bg-off-white border-transparent focus:bg-white border focus:border-navy/10 rounded-xl px-4 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        value={itemForm.category}
                        onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                        placeholder="Jenis Barang"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-navy uppercase tracking-widest mb-1.5 block">Dimensi / Ukuran</label>
                      <input
                        className="w-full h-11 bg-off-white border-transparent focus:bg-white border focus:border-navy/10 rounded-xl px-4 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        value={itemForm.size}
                        onChange={e => setItemForm({ ...itemForm, size: e.target.value })}
                        placeholder="Ex: 60x60cm, 10kg, dll"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-navy uppercase tracking-widest mb-1.5 block">Unit Satuan</label>
                      <input
                        className="w-full h-11 bg-off-white border-transparent focus:bg-white border focus:border-navy/10 rounded-xl px-4 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        value={itemForm.unit}
                        onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                        placeholder="Pcs / Set / Roll"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-navy uppercase tracking-widest mb-1.5 block">Lokasi Rak</label>
                      <input
                        className="w-full h-11 bg-off-white border-transparent focus:bg-white border focus:border-navy/10 rounded-xl px-4 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        value={itemForm.location}
                        onChange={e => setItemForm({ ...itemForm, location: e.target.value })}
                        placeholder="Kode Rak"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-navy uppercase tracking-widest mb-1.5 block">Minimum Stok (Alert)</label>
                      <input
                        className="w-full h-11 bg-off-white border-transparent focus:bg-white border focus:border-navy/10 rounded-xl px-4 text-sm font-bold text-navy placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        type="number"
                        value={itemForm.minStock}
                        onChange={e => setItemForm({ ...itemForm, minStock: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* SINGLE MODE: Optional Initial Stock */}
                  {!editTargetId && (
                    <div className="mt-8 bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                      <h3 className="text-sm font-black text-navy mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-navy text-gold flex items-center justify-center text-xs">📦</span>
                        STOK AWAL (OPSIONAL)
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Supplier</label>
                          <SmartSupplierInput
                            value={singleSelectedSupplier.name || ""}
                            onChange={(val) => {
                              setSingleSelectedSupplier(prev => ({ ...prev, name: val }));
                              setStockSupplierQuery(val);
                            }}
                            onSelect={(id, name) => setSingleSelectedSupplier({ id, name })}
                            placeholder="Cari atau ketik nama supplier..."
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Qty Awal</label>
                            <input type="number" className="w-full h-10 bg-white border border-navy/5 rounded-lg px-3 text-sm font-bold text-navy focus:outline-none focus:ring-1 focus:ring-navy" value={stockForm.qty} onChange={e => setStockForm({ ...stockForm, qty: e.target.value })} placeholder="0" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Satuan</label>
                            <select className="w-full h-10 bg-white border border-navy/5 rounded-lg px-3 text-sm font-bold text-navy focus:outline-none focus:ring-1 focus:ring-navy" value={stockForm.unitQty} onChange={e => setStockForm({ ...stockForm, unitQty: e.target.value as any })}>
                              <option value="satuan">Pcs/Satuan</option>
                              <option value="pack">Pack/Dus</option>
                            </select>
                          </div>

                          {stockForm.unitQty === 'pack' && (
                            <div>
                              <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Isi per Pack</label>
                              <input type="number" className="w-full h-10 bg-white border border-navy/5 rounded-lg px-3 text-sm font-bold text-navy focus:outline-none focus:ring-1 focus:ring-navy" value={stockForm.isiPerPack} onChange={e => setStockForm({ ...stockForm, isiPerPack: e.target.value })} placeholder="1" />
                            </div>
                          )}

                          <div>
                            <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Harga Beli</label>
                            <input type="number" className="w-full h-10 bg-white border border-navy/5 rounded-lg px-3 text-sm font-bold text-navy focus:outline-none focus:ring-1 focus:ring-navy" value={stockForm.harga} onChange={e => setStockForm({ ...stockForm, priceType: 'per_satuan', harga: e.target.value })} placeholder="Rp" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>)}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={handleItemSubmit} disabled={loading} className="btn-gold !h-12 !px-8 shadow-xl shadow-gold/20 text-sm">
                  {loading ? 'MEMPROSES...' : itemMode === 'bulk' ? 'PROSES BULK ITEMS' : 'SIMPAN DATA'}
                </Button>
              </div>
            </div>
          </div>
        )
      }

      {/* Stock Modal (With Suppliers) */}
      {
        stockModalOpen && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-black text-navy tracking-tight">{selectedItem.name}</h2>
                  <p className="text-[10px] font-bold text-gold uppercase tracking-widest mt-0.5">Stock Adjustment</p>
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 font-bold"
                  onClick={() => setStockModalOpen(false)}
                >✕</button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                {/* Mode Toggle */}
                <div className="flex bg-gray-100/50 p-1.5 rounded-xl mb-6 border border-gray-100">
                  {["baru", "bekas"].map(m => (
                    <button key={m} onClick={() => setStockForm({ ...stockForm, mode: m as any })}
                      className={`flex-1 py-2.5 rounded-lg font-black text-xs uppercase tracking-wide transition-all ${stockForm.mode === m ? 'bg-white shadow-sm text-navy ring-1 ring-black/5' : 'text-gray-400 hover:text-navy'}`}>
                      Stok {m}
                    </button>
                  ))}
                </div>

                <div className="space-y-5">
                  {/* Supplier Selection for New Stock */}
                  {stockForm.mode === 'baru' && (
                    <div>
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Supplier</label>
                      <div className="relative z-20">
                        <SmartSupplierInput
                          value={selectedStockSupplier.name || stockSupplierQuery}
                          onChange={(val) => {
                            // Allow typing new supplier
                            setStockSupplierQuery(val);
                            setSelectedStockSupplier(prev => ({ ...prev, name: val }));
                          }}
                          onSelect={(id, name) => {
                            setSelectedStockSupplier({ id, name });
                            setStockSupplierQuery(name);
                          }}
                          placeholder="Cari atau ketik nama supplier..."
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Jumlah Penambahan (Qty)</label>
                    <input className="w-full h-12 bg-off-white/50 border border-navy/10 rounded-xl px-4 text-lg font-black text-navy focus:outline-none focus:ring-2 focus:ring-gold/20" type="number" placeholder="0" value={stockForm.qty} onChange={e => setStockForm({ ...stockForm, qty: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Unit</label>
                      <select className="w-full h-11 bg-white border border-navy/10 rounded-xl px-3 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-gold/20" value={stockForm.unitQty} onChange={e => {
                        const val = e.target.value as any;
                        setStockForm({
                          ...stockForm,
                          unitQty: val,
                          // Auto-set price type based on unit
                          priceType: val === 'pack' ? 'per_pack' : 'per_satuan',
                          harga: ""
                        });
                      }}>
                        <option value="satuan">Satuan ({selectedItem.unit})</option>
                        <option value="pack">Pack / Box</option>
                      </select>
                    </div>

                    {stockForm.unitQty === 'pack' ? (
                      <div>
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Isi Per Pack</label>
                        <input className="w-full h-11 bg-white border border-navy/10 rounded-xl px-3 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-gold/20" type="number" placeholder="1" value={stockForm.isiPerPack} onChange={e => setStockForm({ ...stockForm, isiPerPack: e.target.value })} />
                      </div>
                    ) : (
                      <div className="opacity-30 pointer-events-none">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">Isi Per Pack</label>
                        <input className="w-full h-11 bg-gray-100 border-transparent rounded-xl px-3 text-sm font-bold" disabled value="-" />
                      </div>
                    )}
                  </div>

                  {stockForm.mode === 'baru' && (
                    <div>
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-1.5 block">
                        Harga Beli ({stockForm.unitQty === 'pack' ? 'Per Pack' : 'Per Satuan'})
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-navy/30">Rp</span>
                        <input className="w-full h-11 bg-white border border-navy/10 rounded-xl px-4 pl-10 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-gold/20" type="number" value={stockForm.harga} onChange={e => setStockForm({ ...stockForm, harga: e.target.value })} placeholder="0" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <Button onClick={handleStockSubmit} className="btn-primary w-full !h-12 text-sm shadow-xl shadow-navy/20">SIMPAN STOK</Button>
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
