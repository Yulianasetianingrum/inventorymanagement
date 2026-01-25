"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./items.module.css";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";

type FilterOption = "priority" | "all" | "low" | "empty";
type ItemRow = {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  location: string | null;
  size: string | null;
  unit: string;
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
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed?.error || text);
    } catch {
      throw new Error(text);
    }
  }
  return res.json();
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

const safeFormatDate = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("id-ID");
};

export default function ItemsPage() {
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

  // Compatibility helpers: older code paths may refer to actionMenuId / setActionMenuId
  const actionMenuId = actionMenu?.id ?? null;
  const setActionMenuId = useCallback((id: number | null) => {
    if (id === null) setActionMenu(null);
  }, []);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemRow | null>(null);
  const [stockForm, setStockForm] = useState({
    date: new Date().toISOString().split("T")[0],
    qty: "",
    mode: "baru",
    unitQty: "satuan",
    isiPerPack: "",
    harga: "",
    priceType: "per_satuan",
    note: "",
  });

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    brand: "",
    category: "",
    location: "",
    size: "",
    unit: "pcs",
    minStock: "0",
  });
  const [itemMode, setItemMode] = useState<"single" | "bulk">("single"); // bulk = tambah banyak per toko
  type BulkItemEntry = {
    name: string;
    brand: string;
    category: string;
    location: string;
    size: string;
    unit: string;
    unitQty: "satuan" | "pack";
    isiPerPack: string;
    priceType: "per_satuan" | "per_pack";
    minStock: string;
    qty: string;
    harga: string;
  };
  const [bulkItems, setBulkItems] = useState<BulkItemEntry[]>([
    {
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
      qty: "",
      harga: "",
    },
  ]);
  const [bulkSuppliers, setBulkSuppliers] = useState<SupplierRow[]>([]);
  const [bulkSuppliersLoading, setBulkSuppliersLoading] = useState(false);
  const [bulkSuppliersError, setBulkSuppliersError] = useState<string | null>(null);
  const [bulkSelectedSupplier, setBulkSelectedSupplier] = useState<{ id: number | null; name: string | null }>({
    id: null,
    name: null,
  });
  const [supplierSearch, setSupplierSearch] = useState("");
  const [singleSelectedSupplier, setSingleSelectedSupplier] = useState<{ id: number | null; name: string | null }>({
    id: null,
    name: null,
  });
  const [singleStock, setSingleStock] = useState({ qty: "", harga: "", unitQty: "satuan", priceType: "per_satuan", isiPerPack: "" });
  const bulkDisabled = itemMode === "bulk" && !bulkSelectedSupplier.id;
  const singlePreview = useMemo(() => {
    const qty = Number(singleStock.qty || 0);
    const isiPerPack = Number(singleStock.isiPerPack || 0);
    const harga = Number(singleStock.harga || 0);
    const qtyBase = singleStock.unitQty === "pack" ? qty * (isiPerPack || 0) : qty;
    const unitCost =
      singleStock.priceType === "per_pack"
        ? isiPerPack > 0
          ? Math.floor(harga / isiPerPack)
          : 0
        : harga;
    const totalPembelian = qtyBase * unitCost;
    return { qtyBase, unitCost, totalPembelian };
  }, [singleStock]);

  const [supplierModalItem, setSupplierModalItem] = useState<ItemRow | null>(null);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierMessage, setSupplierMessage] = useState("");
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);
  const [supplierLoadedAll, setSupplierLoadedAll] = useState(false);
  const [supplierHistoryCache, setSupplierHistoryCache] = useState<Record<number, SupplierRow[]>>({});
const [stockSuppliers, setStockSuppliers] = useState<SupplierRow[]>([]);
const [stockSuppliersLoading, setStockSuppliersLoading] = useState(false);
const [stockSuppliersError, setStockSuppliersError] = useState<string | null>(null);
const [stockSupplierQuery, setStockSupplierQuery] = useState("");
const [selectedStockSupplier, setSelectedStockSupplier] = useState<{ id: number | null; name: string | null }>({
  id: null,
  name: null,
});
  const [deleteTarget, setDeleteTarget] = useState<ItemRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  //  ambil filter dari URL: /items?filter=priority|all|low|empty
  useEffect(() => {
    const f = String(searchParams?.get("filter") || "").trim();
    if (f === "priority" || f === "all" || f === "low" || f === "empty") setFilter(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadItems = async (nextFilter?: FilterOption) => {
    const effectiveFilter = nextFilter ?? filter;

    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search.trim()) q.set("search", search.trim());

      // priority = gabungan Wajib Refill + Habis.
      // Cara paling ringan: ambil "all", lalu filter di client.
      q.set("filter", effectiveFilter === "priority" ? "all" : effectiveFilter);

      const data = await fetchJson(`/api/admin/items?${q.toString()}`);
      setItems(data.data ?? []);
    } catch (e) {
      console.error("Failed load items", e);
      toast("Gagal mengambil data items", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const sanitizePhone = (v?: string | null) => (v || "").replace(/[^\d]/g, "");
  const mergeSuppliers = (lists: SupplierRow[][]) => {
    const map = new Map<number, SupplierRow>();
    for (const list of lists) {
      for (const s of list) {
        const existing = map.get(s.id);
        if (!existing) {
          map.set(s.id, s);
          continue;
        }
        // prefer non-empty fields from either source
        map.set(s.id, {
          ...existing,
          ...s,
          waNumber: s.waNumber || existing.waNumber,
          keywords: s.keywords && s.keywords.length ? s.keywords : existing.keywords,
          mapsUrl: s.mapsUrl || existing.mapsUrl,
          lastPrice: s.lastPrice ?? existing.lastPrice ?? null,
          lastPriceAt: s.lastPriceAt || existing.lastPriceAt,
        });
      }
    }
    return Array.from(map.values());
  };
  const prioritizeSuppliers = (list: SupplierRow[], item?: ItemRow | null) => {
    if (!item?.defaultSupplierId) return list;
    const targetId = Number(item.defaultSupplierId);
    return list.slice().sort((a, b) => {
      const aMatch = a.id === targetId ? 1 : 0;
      const bMatch = b.id === targetId ? 1 : 0;
      return bMatch - aMatch;
    });
  };

  const loadSuppliers = useCallback(
    async (item: ItemRow, q?: string, allowFallback = true) => {
      setSuppliersLoading(true);
      setSuppliersError(null);
      try {
        const params = new URLSearchParams();
        params.set("itemId", String(item.id));
        if (q?.trim()) params.set("q", q.trim());
        const res = await fetch(`/api/admin/suppliers/recommend?${params.toString()}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Gagal mengambil rekomendasi supplier");
        const list = Array.isArray(data?.recommended) ? data.recommended : Array.isArray(data?.all) ? data.all : [];
        const history = supplierHistoryCache[item.id] ?? [];
        if (list.length === 0 && allowFallback) {
          // fallback: tampilkan semua supplier (tanpa filter)
          const resAll = await fetch(`/api/admin/suppliers`, { cache: "no-store" });
          const dataAll = await resAll.json().catch(() => ({}));
          if (resAll.ok && Array.isArray(dataAll?.data)) {
            const mappedAll = dataAll.data.map((s: any) => ({
              id: Number(s.id),
              name: String(s.name || s.namaToko || ""),
              waNumber: sanitizePhone(s.waNumber || s.noTelp || ""),
              address: s.alamat || null,
              keywords: Array.isArray(s.keywords)
                ? s.keywords.map((k: any) => String(k).trim()).filter(Boolean)
                : Array.isArray(s.keperluan)
                  ? s.keperluan.map((k: any) => String(k).trim()).filter(Boolean)
                  : String(s.keywords || s.keperluanItems || "")
                      .split(",")
                      .map((k: string) => k.trim())
                      .filter(Boolean),
              mapsUrl: s.mapsUrl ?? s.map ?? null,
              lastPrice: typeof s.lastPrice === "number" ? s.lastPrice : Number(s.lastPrice || s.price || s.harga) || null,
              lastPriceAt: s.lastPriceAt || s.updatedAt || s.updated_at || s.tanggal || s.date || null,
            }));
            const mergedAll = mergeSuppliers([history, mappedAll]);
            setSuppliers(prioritizeSuppliers(mergedAll, item));
            setSupplierLoadedAll(true);
            return;
          }
        }
        const mapped = list.map((s: any) => ({
          id: Number(s.id),
          name: String(s.name || s.namaToko || ""),
          waNumber: sanitizePhone(s.waNumber || s.noTelp || ""),
          address: s.address || s.alamat || null,
          keywords: Array.isArray(s.keywords)
            ? s.keywords.map((k: any) => String(k).trim()).filter(Boolean)
            : String(s.keywords || "")
                .split(",")
                .map((k: string) => k.trim())
                .filter(Boolean),
          mapsUrl: s.mapsUrl ?? s.map ?? null,
          lastPrice: typeof s.lastPrice === "number" ? s.lastPrice : Number(s.lastPrice || s.price || s.harga) || null,
          lastPriceAt: s.lastPriceAt || s.updatedAt || s.updated_at || s.tanggal || s.date || null,
        }));
        const merged = mergeSuppliers([history, mapped]);
        setSuppliers(prioritizeSuppliers(merged, item));
        setSupplierLoadedAll(!q);
      } catch (e) {
        console.error("Failed load suppliers recommend", e);
        setSuppliersError("Gagal mengambil data supplier");
        setSuppliers([]);
      } finally {
        setSuppliersLoading(false);
      }
    },
    [supplierHistoryCache]
  );

  // debounced search on supplierQuery
  useEffect(() => {
    if (!supplierModalItem) return;
    const t = setTimeout(() => {
      loadSuppliers(supplierModalItem, supplierQuery);
    }, 320);
    return () => clearTimeout(t);
  }, [supplierModalItem, supplierQuery, loadSuppliers]);

  const loadStockSuppliers = useCallback(
    async (item: ItemRow, q?: string, allowFallback = true) => {
      setStockSuppliersLoading(true);
      setStockSuppliersError(null);
      try {
        const params = new URLSearchParams();
        params.set("itemId", String(item.id));
        if (q?.trim()) params.set("q", q.trim());
        const res = await fetch(`/api/admin/suppliers/recommend?${params.toString()}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Gagal mengambil data supplier");
        const list = Array.isArray(data?.recommended) ? data.recommended : Array.isArray(data?.all) ? data.all : [];
        if (list.length === 0 && q && allowFallback) {
          await loadStockSuppliers(item, "", false);
          return;
        }
        setStockSuppliers(
          list.map((s: any) => ({
            id: Number(s.id),
            name: String(s.name || s.namaToko || ""),
            waNumber: sanitizePhone(s.waNumber || s.noTelp || ""),
            keywords: Array.isArray(s.keywords)
              ? s.keywords.map((k: any) => String(k).trim()).filter(Boolean)
              : String(s.keywords || "")
                  .split(",")
                  .map((k: string) => k.trim())
                  .filter(Boolean),
            mapsUrl: s.mapsUrl ?? s.map ?? null,
            lastPrice: typeof s.lastPrice === "number" ? s.lastPrice : Number(s.lastPrice || s.price || s.harga) || null,
            lastPriceAt: s.lastPriceAt || s.updatedAt || s.updated_at || s.tanggal || s.date || null,
          }))
        );
      } catch (e) {
        console.error("Failed load suppliers for stock", e);
        setStockSuppliersError("Gagal mengambil data supplier");
        setStockSuppliers([]);
      } finally {
        setStockSuppliersLoading(false);
      }
    },
    []
  );

  const loadBulkSuppliers = useCallback(
    async (q?: string) => {
      setBulkSuppliersLoading(true);
      setBulkSuppliersError(null);
      try {
        const params = new URLSearchParams();
        if (q?.trim()) params.set("q", q.trim());
        const res = await fetch(`/api/admin/suppliers?${params.toString()}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Gagal mengambil supplier");
        const list = Array.isArray(data?.data) ? data.data : [];
        setBulkSuppliers(
          list.map((s: any) => ({
            id: Number(s.id),
            name: String(s.name || s.namaToko || ""),
            waNumber: sanitizePhone(s.waNumber || s.noTelp || ""),
            keywords: Array.isArray(s.keywords)
              ? s.keywords.map((k: any) => String(k).trim()).filter(Boolean)
              : Array.isArray(s.keperluan)
                ? s.keperluan.map((k: any) => String(k).trim()).filter(Boolean)
                : String(s.keywords || s.keperluanItems || "")
                    .split(",")
                    .map((k: string) => k.trim())
                    .filter(Boolean),
            mapsUrl: s.mapsUrl ?? s.map ?? null,
            lastPrice: typeof s.lastPrice === "number" ? s.lastPrice : Number(s.lastPrice || s.price || s.harga) || null,
            lastPriceAt: s.lastPriceAt || s.updatedAt || s.updated_at || s.tanggal || s.date || null,
          }))
        );
      } catch (e) {
        console.error("Failed load suppliers for bulk", e);
        setBulkSuppliersError("Gagal mengambil data supplier");
        setBulkSuppliers([]);
      } finally {
        setBulkSuppliersLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!stockModalOpen || !selectedItem) return;
    const t = setTimeout(() => {
      loadStockSuppliers(selectedItem, stockSupplierQuery);
    }, 320);
    return () => clearTimeout(t);
  }, [stockModalOpen, selectedItem, stockSupplierQuery, loadStockSuppliers]);

  useEffect(() => {
    if (!itemFormOpen) return;
    const t = setTimeout(() => {
      loadBulkSuppliers(supplierSearch.trim());
    }, 320);
    return () => clearTimeout(t);
  }, [itemFormOpen, supplierSearch, loadBulkSuppliers]);

const toggleActionMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>, item: ItemRow) => {
  e.preventDefault();
  e.stopPropagation();

  // NOTE: jangan baca `e.currentTarget` di dalam setState callback.
  // Pada beberapa kondisi (concurrent/strict), event bisa jadi null saat callback dieksekusi.
  const btn = e.currentTarget as HTMLButtonElement | null;
  if (!btn) return;

  const rect = btn.getBoundingClientRect();
  const MENU_WIDTH = 170;
  const GAP = 6;
  const EST_MENU_HEIGHT = 200;

  const spaceBelow = window.innerHeight - rect.bottom;
  const dir: "down" | "up" = spaceBelow < EST_MENU_HEIGHT && rect.top > EST_MENU_HEIGHT ? "up" : "down";

  let left = rect.right - MENU_WIDTH;
  left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8));

  const top = dir === "down" ? rect.bottom + GAP : rect.top - GAP;

  setActionMenu((curr) => {
    if (curr?.id === item.id) return null;
    return { id: item.id, item, left, top, dir };
  });
}, []);

useEffect(() => {
  if (!actionMenu) return;

  const close = () => setActionMenu(null);
  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") close();
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", close);
  // capture scroll from any scroll container
  window.addEventListener("scroll", close, true);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", close);
    window.removeEventListener("scroll", close, true);
  };
}, [actionMenu]);


  const openStockModal = (item: ItemRow) => {
    setSelectedItem(item);
    setStockModalOpen(true);
    setStockForm({
      date: new Date().toISOString().split("T")[0],
      qty: "",
      mode: "baru",
      unitQty: "satuan",
      isiPerPack: "",
      harga: "",
      priceType: "per_satuan",
      note: "",
    });
    setSelectedStockSupplier({ id: null, name: null });
    setStockSupplierQuery(item.name);
    setStockSuppliers([]);
    setStockSuppliersError(null);
    loadStockSuppliers(item, item.name);
    setActionMenu(null);
  };

  const openContactModal = async (item: ItemRow) => {
    setSupplierModalItem(item);
    setSupplierQuery(item.name);
    setSupplierMessage(
      `Permisi, min. Barang ${item.name} masih ready? Saya mau pesan. Kalau ada, mohon info harga dan estimasi pengiriman. Terima kasih.`
    );
    try {
      const resHist = await fetch(`/api/admin/items/${item.id}/riwayat`, { cache: "no-store" });
      const dataHist = await resHist.json().catch(() => ({}));
      if (resHist.ok && Array.isArray(dataHist?.supplierHistory)) {
        const history = dataHist.supplierHistory.map((s: any) => ({
          id: Number(s.id),
          name: String(s.name || `Supplier #${s.id}`),
          waNumber: sanitizePhone((s.phone as string | undefined) || (s.noTelp as string | undefined) || ""),
          keywords: [],
          mapsUrl: null,
          lastPrice: null,
          lastPriceAt: null,
        }));
        setSupplierHistoryCache((prev) => ({ ...prev, [item.id]: history }));
      }
    } catch (err) {
      console.error("Failed load supplier history", err);
    }
    await loadSuppliers(item, item.name);
    setSupplierLoadedAll(false);
  };

  const stockPreview = useMemo(() => {
    const qty = Number(stockForm.qty || 0);
    const isiPerPack = Number(stockForm.isiPerPack || 0);
    const isBekas = stockForm.mode === "bekas";
    const harga = isBekas ? 0 : Number(stockForm.harga || 0);
    const qtyBase = stockForm.unitQty === "pack" ? qty * (isiPerPack || 0) : qty;
    const unitCost =
      isBekas
        ? 0
        : stockForm.priceType === "per_pack"
          ? isiPerPack > 0
            ? Math.floor(harga / isiPerPack)
            : 0
          : harga;
    const totalPembelian = isBekas ? 0 : qtyBase * unitCost;
    return { qtyBase, unitCost, totalPembelian };
  }, [stockForm]);

  const submitStock = async () => {
    if (!selectedItem) return;
    const qty = Number(stockForm.qty || 0);
    const isiPerPack = Number(stockForm.isiPerPack || 0);
    const isBekas = stockForm.mode === "bekas";
    const harga = isBekas ? 0 : Number(stockForm.harga || 0);
    if (qty <= 0 || Number.isNaN(qty)) return toast("Qty wajib diisi dan lebih dari 0", true);
    if (stockForm.unitQty === "pack" && (isiPerPack <= 0 || Number.isNaN(isiPerPack)))
      return toast("Isi per pack wajib diisi dan lebih dari 0", true);
    if (!isBekas) {
      if (harga <= 0 || Number.isNaN(harga)) return toast("Harga wajib diisi dan lebih dari 0", true);
      if (stockPreview.unitCost <= 0) return toast("Unit cost belum valid. Cek harga/isi per pack.", true);
    }
    const qtyBase = stockForm.unitQty === "pack" ? qty * (isiPerPack || 0) : qty;
    if (isBekas && (selectedItem.stockNew ?? 0) < qtyBase) {
      return toast("Stok baru tidak cukup untuk dipindah ke bekas", true);
    }

    try {
      await fetchJson(`/api/admin/items/${selectedItem.id}/stock-in`, {
        method: "POST",
        body: JSON.stringify({
          date: stockForm.date,
          qty,
          unitQty: stockForm.unitQty,
          isiPerPack: stockForm.unitQty === "pack" ? isiPerPack : undefined,
          harga,
          priceType: stockForm.priceType,
          mode: stockForm.mode,
          note: stockForm.note || undefined,
          supplierId: isBekas ? undefined : selectedStockSupplier.id ?? undefined,
        }),
      });
      setStockModalOpen(false);
      await loadItems();
      toast("Stok berhasil ditambahkan");
    } catch (e) {
      console.error("Failed add stock", e);
      toast((e as Error)?.message || "Gagal menambah stok", true);
    }
  };

  const submitNewItem = async () => {
    if (itemMode === "single" && !itemForm.name.trim()) return toast("Nama wajib diisi", true);
    if (itemMode === "single" && !itemForm.brand.trim()) return toast("Brand wajib diisi", true);
    if (itemMode === "single" && !itemForm.size.trim()) return toast("Size wajib diisi", true);
    if (itemMode === "bulk") {
      if (!bulkSelectedSupplier.id) return toast("Pilih supplier terlebih dahulu untuk batch borongan", true);
      // proses banyak item per toko
      const rows = bulkItems
        .map((r) => ({
          name: r.name.trim(),
          brand: r.brand.trim(),
          category: r.category.trim(),
          location: r.location.trim(),
          size: r.size.trim(),
          unit: r.unit.trim() || "pcs",
          unitQty: r.unitQty,
          isiPerPack: Number(r.isiPerPack || 0),
          priceType: r.priceType,
          minStock: Number(r.minStock || 0),
          qty: Number(r.qty || 0),
          harga: Number(r.harga || 0),
        }))
        .filter((r) => r.name);
      if (!rows.length) return toast("Isi minimal 1 item", true);

      const invalidPack = rows.find((r) => r.unitQty === "pack" && (r.isiPerPack <= 0 || Number.isNaN(r.isiPerPack)));
      if (invalidPack) return toast("Isi per pack wajib diisi dan lebih dari 0 untuk item dengan unit pack", true);
      const invalidBrandSize = rows.find((r) => !r.brand || !r.size);
      if (invalidBrandSize) return toast("Brand dan size wajib diisi untuk setiap item", true);
      const invalidQtyHarga = rows.find((r) => r.qty <= 0 || Number.isNaN(r.qty) || r.harga <= 0 || Number.isNaN(r.harga));
      if (invalidQtyHarga) return toast("Qty dan harga wajib diisi dan lebih dari 0 untuk setiap item", true);
      const rowsWithExisting = rows.map((r) => ({
        ...r,
        existing: items.find(
          (x) =>
            x.name.trim().toLowerCase() === r.name.toLowerCase() &&
            (x.brand || "").trim().toLowerCase() === r.brand.toLowerCase() &&
            (x.size || "").trim().toLowerCase() === r.size.toLowerCase()
        ),
      }));
      const invalidNewRequired = rowsWithExisting.find(
        (r) => !r.existing && (!r.category || !r.location || !r.unit)
      );
      if (invalidNewRequired) return toast("Kategori, lokasi, dan satuan wajib diisi untuk item baru", true);

      try {
        for (const row of rowsWithExisting) {
          if (row.existing) {
            if (row.qty > 0 && row.harga > 0) {
              await fetchJson(`/api/admin/items/${row.existing.id}/stock-in`, {
                method: "POST",
                body: JSON.stringify({
                  date: new Date().toISOString().split("T")[0],
                  qty: row.qty,
                  unitQty: row.unitQty,
                  isiPerPack: row.unitQty === "pack" ? row.isiPerPack : undefined,
                  harga: row.harga,
                  priceType: row.priceType,
                  mode: "baru",
                  supplierId: bulkSelectedSupplier.id ?? undefined,
                }),
              });
            }
          } else {
            const payload = {
              name: row.name,
              brand: row.brand || null,
              category: row.category || null,
              location: row.location || null,
              size: row.size || null,
              unit: row.unit || "pcs",
              minStock: Number.isFinite(row.minStock) && row.minStock >= 0 ? row.minStock : 0,
            };
            const created = await fetchJson("/api/admin/items", {
              method: "POST",
              body: JSON.stringify({ ...payload, stockNew: 0, stockUsed: 0 }),
            });
            const newId = created?.data?.id || created?.id;
            if (newId && row.qty > 0 && row.harga > 0) {
              await fetchJson(`/api/admin/items/${newId}/stock-in`, {
                method: "POST",
                body: JSON.stringify({
                  date: new Date().toISOString().split("T")[0],
                  qty: row.qty,
                  unitQty: row.unitQty,
                  isiPerPack: row.unitQty === "pack" ? row.isiPerPack : undefined,
                  harga: row.harga,
                  priceType: row.priceType,
                  mode: "baru",
                  supplierId: bulkSelectedSupplier.id ?? undefined,
                }),
              });
            }
          }
        }
        setItemFormOpen(false);
        setBulkItems([
          {
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
            qty: "",
            harga: "",
          },
        ]);
        setItemForm({
          name: "",
          brand: "",
          category: "",
          location: "",
          size: "",
          unit: "pcs",
          minStock: "0",
        });
        setSingleSelectedSupplier({ id: null, name: null });
        setEditTargetId(null);
        setActionMenu(null);
        setItemMode("single");
        await loadItems();
        toast("Berhasil proses tambah item/stok", false);
      } catch (e) {
        console.error("Failed bulk save item", e);
        toast((e as Error)?.message || "Gagal menyimpan item", true);
      }
    } else {
      const qtySingle = Number(singleStock.qty || 0);
      const isiPerPackSingle = Number(singleStock.isiPerPack || 0);
      const hargaSingle = Number(singleStock.harga || 0);

      const existingSingle = items.find(
        (x) =>
          x.name.trim().toLowerCase() === itemForm.name.trim().toLowerCase() &&
          (x.brand || "").trim().toLowerCase() === itemForm.brand.trim().toLowerCase() &&
          (x.size || "").trim().toLowerCase() === itemForm.size.trim().toLowerCase() &&
          x.id !== editTargetId
      );

      if (existingSingle) {
        if (qtySingle <= 0 || Number.isNaN(qtySingle)) return toast("Qty wajib diisi dan lebih dari 0", true);
        if (singleStock.unitQty === "pack" && (isiPerPackSingle <= 0 || Number.isNaN(isiPerPackSingle)))
          return toast("Isi per pack wajib diisi dan lebih dari 0", true);
        if (hargaSingle <= 0 || Number.isNaN(hargaSingle)) return toast("Harga wajib diisi dan lebih dari 0", true);
        const unitCost =
          singleStock.priceType === "per_pack"
            ? isiPerPackSingle > 0
              ? Math.floor(hargaSingle / isiPerPackSingle)
              : 0
            : hargaSingle;
        if (unitCost <= 0) return toast("Unit cost belum valid. Cek harga/isi per pack.", true);

        try {
          await fetchJson(`/api/admin/items/${existingSingle.id}/stock-in`, {
            method: "POST",
            body: JSON.stringify({
              date: new Date().toISOString().split("T")[0],
              qty: qtySingle,
              unitQty: singleStock.unitQty,
              isiPerPack: singleStock.unitQty === "pack" ? isiPerPackSingle : undefined,
              harga: hargaSingle,
              priceType: singleStock.priceType,
              mode: "baru",
              supplierId: singleSelectedSupplier.id ?? undefined,
            }),
          });
          setItemFormOpen(false);
          setItemForm({
            name: "",
            brand: "",
            category: "",
            location: "",
            size: "",
            unit: "pcs",
            minStock: "0",
          });
          setSingleStock({ qty: "", harga: "", unitQty: "satuan", priceType: "per_satuan", isiPerPack: "" });
          setSingleSelectedSupplier({ id: null, name: null });
          setEditTargetId(null);
          setActionMenu(null);
          setItemMode("single");
          await loadItems();
          toast("Stok ditambahkan ke item existing", false);
        } catch (e) {
          console.error("Failed stock-in existing item", e);
          toast((e as Error)?.message || "Gagal menambah stok", true);
        }
        return;
      }

      const minStock = Number(itemForm.minStock || 0);
      if (minStock < 0 || Number.isNaN(minStock)) return toast("Min stok tidak valid", true);
      if (!itemForm.brand.trim() || !itemForm.size.trim()) return toast("Brand dan size wajib diisi", true);
      if (!itemForm.category.trim() || !itemForm.location.trim()) return toast("Kategori dan lokasi wajib diisi", true);
      if (!itemForm.unit.trim()) return toast("Satuan wajib diisi", true);
      try {
        const payload = {
          name: itemForm.name.trim(),
          brand: itemForm.brand.trim() || null,
          category: itemForm.category.trim() || null,
          location: itemForm.location.trim() || null,
          size: itemForm.size.trim() || null,
          unit: itemForm.unit || "pcs",
          minStock,
        };
        let targetId = editTargetId || null;
        if (editTargetId) {
          await fetchJson(`/api/admin/items/${editTargetId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
        } else {
          if (qtySingle <= 0 || Number.isNaN(qtySingle)) return toast("Qty wajib diisi dan lebih dari 0", true);
          if (singleStock.unitQty === "pack" && (isiPerPackSingle <= 0 || Number.isNaN(isiPerPackSingle)))
            return toast("Isi per pack wajib diisi dan lebih dari 0", true);
          if (hargaSingle <= 0 || Number.isNaN(hargaSingle)) return toast("Harga wajib diisi dan lebih dari 0", true);
          const unitCostSingle =
            singleStock.priceType === "per_pack"
              ? isiPerPackSingle > 0
                ? Math.floor(hargaSingle / isiPerPackSingle)
                : 0
              : hargaSingle;
          if (unitCostSingle <= 0) return toast("Unit cost belum valid. Cek harga/isi per pack.", true);

          const created = await fetchJson("/api/admin/items", {
            method: "POST",
            body: JSON.stringify({ ...payload, stockNew: 0, stockUsed: 0 }),
          });
          targetId = created?.data?.id || created?.id || null;
        }

        if (targetId && qtySingle > 0 && hargaSingle > 0) {
          await fetchJson(`/api/admin/items/${targetId}/stock-in`, {
            method: "POST",
            body: JSON.stringify({
              date: new Date().toISOString().split("T")[0],
              qty: qtySingle,
              unitQty: singleStock.unitQty,
              isiPerPack: singleStock.unitQty === "pack" ? isiPerPackSingle || undefined : undefined,
              harga: hargaSingle,
              priceType: singleStock.priceType,
              mode: "baru",
              supplierId: singleSelectedSupplier.id ?? undefined,
            }),
          });
        }
        setItemFormOpen(false);
        setItemForm({
          name: "",
          brand: "",
          category: "",
          location: "",
          size: "",
          unit: "pcs",
          minStock: "0",
        });
        setSingleStock({ qty: "", harga: "", unitQty: "satuan", priceType: "per_satuan", isiPerPack: "" });
        setSingleSelectedSupplier({ id: null, name: null });
        setEditTargetId(null);
        setActionMenu(null);
        setItemMode("single");
        await loadItems();
      } catch (e) {
        console.error("Failed save item", e);
        toast("Gagal menyimpan item", true);
      }
    }
  };

  const startEdit = (item: ItemRow) => {
    setEditTargetId(item.id);
    setItemForm({
      name: item.name,
      brand: item.brand || "",
      category: item.category || "",
      location: item.location || "",
      size: item.size || "",
      unit: item.unit || "pcs",
      minStock: String(item.minStock ?? 0),
    });
    setSingleSelectedSupplier({ id: null, name: null });
    setItemFormOpen(true);
    setActionMenu(null);
  };

  const softDelete = (item: ItemRow) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetchJson(`/api/admin/items/${deleteTarget.id}`, { method: "DELETE" });
      await loadItems();
      toast("Item dihapus");
    } catch (e) {
      console.error("Failed delete item", e);
      toast((e as Error)?.message || "Gagal menghapus item", true);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const statusClass = (status: ItemRow["statusRefill"]) => {
    if (status === "Habis") return styles.badgeDanger;
    if (status === "Wajib Refill") return styles.badgeWarn;
    return styles.badgeSafe;
  };

  useEffect(() => {
    const close = () => setActionMenu(null);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close, { passive: true });
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, []);

  //  kalau priority: tampilkan yang bukan "Aman"
  const filtered = filter === "priority" ? items.filter((x) => x.statusRefill !== "Aman") : items;

  const urgentItems = useMemo(() => {
    const urgent = items.filter((x) => x.statusRefill !== "Aman");
    return urgent.sort((a, b) => {
      if (a.statusRefill === "Habis" && b.statusRefill !== "Habis") return -1;
      if (b.statusRefill === "Habis" && a.statusRefill !== "Habis") return 1;
      return a.stockTotal - b.stockTotal;
    });
  }, [items]);

  const setFilterAndUrl = (opt: FilterOption) => {
    setFilter(opt);
    router.push(`/items?filter=${opt}`);
  };

  function toast(msg: string, error?: boolean) {
    const el = document.createElement("div");
    el.className = `${styles.toast} ${error ? styles.toastError : ""}`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add(styles.toastShow));
    setTimeout(() => {
      el.classList.remove(styles.toastShow);
      setTimeout(() => el.remove(), 200);
    }, 1400);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <img src="/logo/apix.png" alt="Apix Interior" />
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Apix Interior</div>
            <div className={styles.brandSubtitle}>Items</div>
          </div>
        </div>
        <div className={styles.topActions}>
          <Button
            className={styles.secondaryBtn}
            style={{ background: "var(--white)", color: "var(--navy)", border: "1px solid var(--gold)" }}
            onClick={() => router.push("/dashboard")}
          >
            ← Kembali
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>Data Input Item Gudang</div>
              <div className={styles.sectionSubtitle}>Monitor stok gudang, harga beli dan refill.</div>
            </div>
            <div className={styles.pills}>
              {(["priority", "all", "low", "empty"] as FilterOption[]).map((opt) => (
                <button
                  key={opt}
                  className={`${styles.pill} ${filter === opt ? styles.pillActive : ""}`}
                  onClick={() => setFilterAndUrl(opt)}
                >
                  {opt === "priority"
                    ? "Prioritas (Refill + Habis)"
                    : opt === "all"
                      ? "Semua"
                      : opt === "low"
                        ? "Wajib Refill"
                        : "Habis"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterRow}>
            <input
              className={styles.searchInput}
              placeholder="Cari nama / brand / kategori / lokasi / size"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadItems()}
            />
            <Button onClick={() => loadItems()} disabled={loading}>
              {loading ? "Memuat..." : "Cari"}
            </Button>
          </div>
          <div className={styles.addRow}>
            <Button
              className={styles.newBtn}
              style={{ background: "var(--gold)", color: "var(--navy)", border: "1px solid var(--gold-dark)" }}
              onClick={() => {
                setEditTargetId(null);
                setItemForm({
                  name: "",
                  brand: "",
                  category: "",
                  location: "",
                  size: "",
                  unit: "pcs",
                  minStock: "0",
                });
                setItemFormOpen(true);
              }}
            >
              + Tambah Item
            </Button>
          </div>

          <Card className={styles.tableCard}>
            <div className={styles.tableContainer}>
              <table className={styles.listTable}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Brand</th>
                    <th>Kategori</th>
                    <th>Lokasi</th>
                    <th>Size</th>
                    <th>Satuan</th>
                    <th>Qty Baru</th>
                    <th>Qty Bekas</th>
                    <th>Total Qty</th>
                    <th>Min Stok</th>
                    <th>Status</th>
                    <th>Nilai Stok</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it) => (
                    <tr key={it.id}>
                      <td className={styles.bold}>{it.name}</td>
                      <td>{it.brand || "-"}</td>
                      <td>{it.category || "-"}</td>
                      <td>{it.location || "-"}</td>
                      <td>{it.size || "-"}</td>
                      <td>{it.unit}</td>
                      <td>
                        <div className={styles.bold}>{it.stockNew}</div>
                        <div className={styles.subNote}>Sisa stok baru</div>
                      </td>
                      <td>
                        <div className={styles.bold}>{it.stockUsed}</div>
                        <div className={styles.subNote}>Stok bekas</div>
                      </td>
                      <td>
                        <div className={styles.bold}>{it.stockTotal}</div>
                        <div className={styles.subNote}>Total stok</div>
                      </td>
                      <td>{it.minStock}</td>
                      <td>
                        <span className={`${styles.badge} ${statusClass(it.statusRefill)}`}>{it.statusRefill}</span>
                      </td>
                      <td>
                        <div>{formatCurrency(it.nilaiStok)}</div>
                        <div className={styles.subNote}>Nilai stok tersisa</div>
                      </td>
                      <td className={styles.actionCell}>
                        {it.statusRefill !== "Aman" ? (
                          <button
                            className={styles.contactBtn}
                            onClick={() => openContactModal(it)}
                            title="Hubungi supplier"
                            type="button"
                          >
                            Hubungi
                          </button>
                        ) : null}
                        <button className={styles.actionBtn} onClick={(e) => toggleActionMenu(e, it)}>
                          Aksi <span className={styles.caret} aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={13} style={{ textAlign: "center", color: "var(--muted)" }}>
                        Belum ada data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className={styles.cardList}>
            {filtered.map((it) => (
              <Card key={it.id} className={styles.cardItem}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardTitle}>{it.name}</div>
                    <div className={styles.cardMeta}>
                      {it.brand || "-"} · {it.category || "-"} · {it.location || "-"}
                    </div>
                    <div className={styles.cardMeta}>Size: {it.size || "-"} | Satuan: {it.unit}</div>
                  </div>
                  <span className={`${styles.badge} ${statusClass(it.statusRefill)}`}>{it.statusRefill}</span>
                </div>
                <div className={styles.cardStats}>
                  <div>
                    <div className={styles.statLabel}>Baru</div>
                    <div className={styles.statValue}>{it.stockNew}</div>
                    <div className={styles.subNote}>Sisa stok baru</div>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Bekas</div>
                    <div className={styles.statValue}>{it.stockUsed}</div>
                    <div className={styles.subNote}>Stok bekas</div>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Total</div>
                    <div className={styles.statValue}>{it.stockTotal}</div>
                    <div className={styles.subNote}>Total stok</div>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Min</div>
                    <div className={styles.statValue}>{it.minStock}</div>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <div>
                    <div className={styles.statLabel}>Nilai Stok</div>
                    <div className={styles.statValue}>{formatCurrency(it.nilaiStok)}</div>
                    <div className={styles.subNote}>Nilai stok tersisa</div>
                  </div>
                  <div className={styles.cardActions}>
                    <Button
                      style={{ background: "var(--navy)", color: "#fff", border: "1px solid var(--navy)" }}
                      onClick={() => openStockModal(it)}
                    >
                      Tambah Stok
                    </Button>
                    <Button
                      style={{ background: "var(--white)", color: "var(--navy)", border: "1px solid var(--gold)" }}
                      onClick={() => router.push(`/items/${it.id}/riwayat`)}
                    >
                      Riwayat
                    </Button>
                    <Button
                      style={{ background: "#fff1f1", color: "var(--danger)", border: "1px solid #fecdd3" }}
                      onClick={() => softDelete(it)}
                    >
                      Hapus
                    </Button>
                    {it.statusRefill !== "Aman" ? (
                      <Button
                        style={{ background: "#eef2ff", color: "var(--navy)", border: "1px solid #c7d2fe" }}
                        onClick={() => openContactModal(it)}
                      >
                        Hubungi
                      </Button>
                    ) : null}
                    <Button
                      style={{ background: "var(--white)", color: "var(--navy)", border: "1px solid var(--navy)" }}
                      onClick={() => startEdit(it)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {!filtered.length ? <Card className={styles.cardItem}>Belum ada data</Card> : null}
          </div>
        </section>
      </main>

      <Modal
      open={stockModalOpen}
      title={selectedItem ? `Tambah Stok - ${selectedItem.name}` : "Tambah Stok"}
      onClose={() => setStockModalOpen(false)}
    >
      <div className={styles.modalForm}>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${stockForm.mode === "baru" ? styles.modeBtnActive : ""}`}
            onClick={() => setStockForm((f) => ({ ...f, mode: "baru" }))}
          >
            Barang baru
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${stockForm.mode === "bekas" ? styles.modeBtnActive : ""}`}
            onClick={() => setStockForm((f) => ({ ...f, mode: "bekas", harga: "", priceType: "per_satuan" }))}
          >
            Barang bekas (pengembalian)
          </button>
        </div>
          <div className={styles.formGrid}>
            <label>Tanggal</label>
            <input type="date" value={stockForm.date} onChange={(e) => setStockForm((f) => ({ ...f, date: e.target.value }))} />
            <label>Qty</label>
            <input type="number" value={stockForm.qty} onChange={(e) => setStockForm((f) => ({ ...f, qty: e.target.value }))} />
            <label>Unit Qty</label>
            <select
              value={stockForm.unitQty}
              onChange={(e) => {
                const nextUnit = e.target.value;
                setStockForm((f) => ({
                  ...f,
                  unitQty: nextUnit,
                  priceType: nextUnit === "pack" ? "per_pack" : "per_satuan",
                  isiPerPack: nextUnit === "pack" ? f.isiPerPack : "",
                }));
              }}
            >
              <option value="satuan">Satuan</option>
              <option value="pack">Pack</option>
            </select>
            {stockForm.unitQty === "pack" ? (
              <>
                <label>Isi per pack</label>
                <input
                  type="number"
                  value={stockForm.isiPerPack}
                  onChange={(e) => setStockForm((f) => ({ ...f, isiPerPack: e.target.value }))}
                />
              </>
            ) : null}
            {stockForm.mode !== "bekas" ? (
              <>
                <label>Harga</label>
                <input
                  type="number"
                  value={stockForm.harga}
                  onChange={(e) => setStockForm((f) => ({ ...f, harga: e.target.value }))}
                />
                <label>Tipe Harga</label>
              <select
                value={stockForm.priceType}
                onChange={(e) => {
                  const next = e.target.value;
                  // jaga konsistensi: jika unitQty satuan dan user pilih per_pack, paksa per_satuan
                  if (stockForm.unitQty === "satuan" && next === "per_pack") {
                    setStockForm((f) => ({ ...f, priceType: "per_satuan" }));
                  } else {
                    setStockForm((f) => ({ ...f, priceType: next }));
                  }
                }}
              >
                <option value="per_satuan">Per satuan</option>
                <option value="per_pack">Per pack</option>
              </select>
                <label>Supplier (opsional)</label>
                <div className={styles.formRow}>
                  <input
                    className={styles.searchInput}
                    placeholder="Cari nama supplier atau kebutuhan"
                    value={stockSupplierQuery}
                    onChange={(e) => setStockSupplierQuery(e.target.value)}
                    onBlur={() => selectedItem && loadStockSuppliers(selectedItem, stockSupplierQuery)}
                  />
                  <div className={styles.muted} style={{ marginTop: 4 }}>
                    {stockSuppliersLoading ? "Memuat supplier..." : stockSuppliersError || ""}
                  </div>
                  <select
                    value={selectedStockSupplier.id ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setSelectedStockSupplier({ id: null, name: null });
                        return;
                      }
                      const chosen = stockSuppliers.find((s) => String(s.id) === val);
                      setSelectedStockSupplier({ id: Number(val), name: chosen?.name || null });
                    }}
                  >
                    <option value="">Tanpa supplier</option>
                    {stockSuppliers.map((s) => {
                      const priceLabel =
                        typeof s.lastPrice === "number" && !Number.isNaN(s.lastPrice)
                          ? `${formatCurrency(Number(s.lastPrice))}${safeFormatDate(s.lastPriceAt) ? ` (${safeFormatDate(s.lastPriceAt)})` : ""}`
                          : null;
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name}
                          {priceLabel ? ` - ${priceLabel}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            ) : null}
            <label>Catatan/Nota/Supplier</label>
            <input value={stockForm.note} onChange={(e) => setStockForm((f) => ({ ...f, note: e.target.value }))} />
          </div>
          <div className={styles.previewBox}>
            <div className={styles.previewLine}>
              <span>Mode</span>
              <span className={styles.bold}>{stockForm.mode === "bekas" ? "Barang bekas (kembali)" : "Barang baru"}</span>
            </div>
            <div className={styles.previewLine}>
              <span>Qty dasar</span>
              <span className={styles.bold}>{stockPreview.qtyBase || 0}</span>
            </div>
            <div className={styles.previewLine}>
              <span>Unit cost</span>
              <span className={styles.bold}>{formatCurrency(stockPreview.unitCost || 0)}</span>
            </div>
            <div className={styles.previewLine}>
              <span>Supplier</span>
              <span className={styles.bold}>{stockForm.mode === "bekas" ? "-" : selectedStockSupplier.name || "-"}</span>
            </div>
            <div className={styles.previewLine}>
              <span>Total pembelian</span>
              <span className={styles.bold}>{formatCurrency(stockPreview.totalPembelian || 0)}</span>
            </div>
          </div>
          <Button onClick={submitStock} style={{ background: "var(--gold)", color: "var(--navy)", border: "1px solid var(--gold-dark)" }}>
            Simpan Stok
          </Button>
        </div>
      </Modal>

      <Modal
        open={itemFormOpen}
        title={editTargetId ? "Edit Item" : "Tambah Item"}
        onClose={() => {
          setItemFormOpen(false);
          setEditTargetId(null);
        }}
      >
        <div className={styles.modalForm}>
          <div className={styles.modeToggle}>
            <button
              type="button"
              className={`${styles.modeBtn} ${itemMode === "single" ? styles.modeBtnActive : ""}`}
              onClick={() => setItemMode("single")}
            >
              Tambah item satuan
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${itemMode === "bulk" ? styles.modeBtnActive : ""}`}
              onClick={() => setItemMode("bulk")}
            >
              Tambah banyak (per toko)
            </button>
          </div>
          <div className={styles.muted} style={{ marginBottom: 8 }}>
            {itemMode === "single"
              ? "Mode satuan: selalu buat item baru."
              : "Mode per toko: jika nama + brand sudah ada, langsung dialihkan ke tambah stok."}
          </div>
          {itemMode === "single" ? (
            <>
              <label>Nama</label>
              <input value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))} />
              <label>Brand</label>
              <input value={itemForm.brand} onChange={(e) => setItemForm((f) => ({ ...f, brand: e.target.value }))} />
              <label>Kategori</label>
              <input value={itemForm.category} onChange={(e) => setItemForm((f) => ({ ...f, category: e.target.value }))} />
              <label>Lokasi</label>
              <input value={itemForm.location} onChange={(e) => setItemForm((f) => ({ ...f, location: e.target.value }))} />
              <label>Size</label>
              <input value={itemForm.size} onChange={(e) => setItemForm((f) => ({ ...f, size: e.target.value }))} />
              <label>Satuan</label>
              <input value={itemForm.unit} onChange={(e) => setItemForm((f) => ({ ...f, unit: e.target.value }))} />
              <label>Min Stok</label>
              <input type="number" value={itemForm.minStock} onChange={(e) => setItemForm((f) => ({ ...f, minStock: e.target.value }))} />
              <label>Qty stok-in (opsional)</label>
              <input
                type="number"
                value={singleStock.qty}
                onChange={(e) => setSingleStock((s) => ({ ...s, qty: e.target.value }))}
                placeholder="0"
              />
              <label>Unit Qty</label>
              <select
                className={styles.coloredSelect}
                value={singleStock.unitQty}
                onChange={(e) => {
                  const nextUnit = e.target.value;
                  setSingleStock((s) => ({
                    ...s,
                    unitQty: nextUnit,
                    priceType: nextUnit === "pack" ? "per_pack" : "per_satuan",
                    isiPerPack: nextUnit === "pack" ? s.isiPerPack : "",
                  }));
                }}
              >
                <option value="satuan">Satuan</option>
                <option value="pack">Pack</option>
              </select>
              {singleStock.unitQty === "pack" ? (
                <>
                  <label>Isi per pack</label>
                  <input
                    type="number"
                    value={singleStock.isiPerPack}
                    onChange={(e) => setSingleStock((s) => ({ ...s, isiPerPack: e.target.value }))}
                    placeholder="0"
                  />
                </>
              ) : null}
              <label>Harga</label>
              <input
                type="number"
                value={singleStock.harga}
                onChange={(e) => setSingleStock((s) => ({ ...s, harga: e.target.value }))}
                placeholder="0"
              />
              <label>Tipe Harga</label>
              <select
                className={styles.coloredSelect}
                value={singleStock.priceType}
                onChange={(e) => {
                  const next = e.target.value;
                  if (singleStock.unitQty === "satuan" && next === "per_pack") {
                    setSingleStock((s) => ({ ...s, priceType: "per_satuan" }));
                  } else {
                    setSingleStock((s) => ({ ...s, priceType: next }));
                  }
                }}
              >
                <option value="per_satuan">Per satuan</option>
                <option value="per_pack">Per pack</option>
              </select>
              <label>Cari supplier</label>
              <input
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="Cari nama supplier"
              />
              <label>Supplier (opsional)</label>
              <select
                className={styles.coloredSelect}
                value={singleSelectedSupplier.id ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSingleSelectedSupplier({ id: null, name: null });
                    return;
                  }
                  const chosen = bulkSuppliers.find((s) => String(s.id) === val);
                  setSingleSelectedSupplier({ id: Number(val), name: chosen?.name || null });
                }}
              >
                <option value="">Tidak pakai supplier</option>
                {bulkSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className={styles.previewBox} style={{ gridColumn: "1 / -1", marginTop: 6 }}>
                <div className={styles.previewLine}>
                  <span>Qty dasar</span>
                  <span className={styles.bold}>{singlePreview.qtyBase || 0}</span>
                </div>
                <div className={styles.previewLine}>
                  <span>Unit cost</span>
                  <span className={styles.bold}>{formatCurrency(singlePreview.unitCost || 0)}</span>
                </div>
                <div className={styles.previewLine}>
                  <span>Total pembelian</span>
                  <span className={styles.bold}>{formatCurrency(singlePreview.totalPembelian || 0)}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.formRow}>
                <label>Supplier untuk batch ini (wajib)</label>
                <input
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Cari supplier"
                />
                <select
                  value={bulkSelectedSupplier.id ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setBulkSelectedSupplier({ id: null, name: null });
                      return;
                    }
                    const chosen = bulkSuppliers.find((s) => String(s.id) === val);
                    setBulkSelectedSupplier({ id: Number(val), name: chosen?.name || null });
                  }}
                >
                  <option value="">Pilih supplier</option>
                  {bulkSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className={styles.muted} style={{ marginTop: 4 }}>
                  {bulkSuppliersLoading ? "Memuat supplier..." : bulkSuppliersError || ""}
                </div>
              </div>
              {bulkItems.map((row, idx) => (
                <div key={idx} className={styles.bulkRow}>
                  <div>
                    <label>Nama</label>
                    <input
                      value={row.name}
                      disabled={bulkDisabled}
                      onChange={(e) =>
                        setBulkItems((arr) =>
                          arr.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r))
                        )
                      }
                      placeholder="Nama item"
                    />
                  </div>
                  <div>
                    <label>Brand</label>
                    <input
                      value={row.brand}
                      disabled={bulkDisabled}
                      onChange={(e) =>
                        setBulkItems((arr) =>
                          arr.map((r, i) => (i === idx ? { ...r, brand: e.target.value } : r))
                        )
                      }
                      placeholder="Brand"
                    />
                  </div>
                  <div>
                    <label>Kategori</label>
                    <input
                      value={row.category}
                      disabled={bulkDisabled}
                      onChange={(e) =>
                        setBulkItems((arr) =>
                          arr.map((r, i) => (i === idx ? { ...r, category: e.target.value } : r))
                        )
                      }
                      placeholder="Kategori"
                    />
                  </div>
                  <div>
                    <label>Lokasi</label>
                    <input
                      value={row.location}
                      disabled={bulkDisabled}
                      onChange={(e) =>
                        setBulkItems((arr) =>
                          arr.map((r, i) => (i === idx ? { ...r, location: e.target.value } : r))
                        )
                      }
                      placeholder="Rak A"
                    />
                  </div>
                  <div>
                    <label>Size</label>
                    <input
                      value={row.size}
                      disabled={bulkDisabled}
                      onChange={(e) =>
                        setBulkItems((arr) =>
                          arr.map((r, i) => (i === idx ? { ...r, size: e.target.value } : r))
                        )
                      }
                      placeholder="Ukuran"
                    />
                  </div>
                  <div>
                    <label>Unit</label>
                    <input
                      value={row.unit}
                      disabled={bulkDisabled}
                      onChange={(e) =>
                        setBulkItems((arr) =>
                          arr.map((r, i) => (i === idx ? { ...r, unit: e.target.value } : r))
                        )
                      }
                      placeholder="pcs"
                    />
                  </div>
                  <div>
                    <label>Unit Qty</label>
                    <select
                      className={styles.coloredSelect}
                      value={row.unitQty}
                      disabled={bulkDisabled}
                      onChange={(e) => {
                        const nextUnit = e.target.value as "satuan" | "pack";
                        setBulkItems((arr) =>
                          arr.map((r, i) =>
                            i === idx
                              ? {
                                  ...r,
                                  unitQty: nextUnit,
                                  priceType: nextUnit === "pack" ? "per_pack" : "per_satuan",
                                  isiPerPack: nextUnit === "pack" ? r.isiPerPack : "",
                                }
                              : r
                          )
                        );
                      }}
                    >
                      <option value="satuan">Satuan</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>
                  {row.unitQty === "pack" ? (
                    <div>
                      <label>Isi per pack</label>
                      <input
                        type="number"
                        value={row.isiPerPack}
                        disabled={bulkDisabled}
                        onChange={(e) =>
                          setBulkItems((arr) =>
                            arr.map((r, i) => (i === idx ? { ...r, isiPerPack: e.target.value } : r))
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  ) : null}
                  <div>
                    <label>Min Stok</label>
                    <input
                      type="number"
                      value={row.minStock}
                      disabled={bulkDisabled}
                      onChange={(e) =>
                        setBulkItems((arr) =>
                          arr.map((r, i) => (i === idx ? { ...r, minStock: e.target.value } : r))
                        )
                      }
                    />
                  </div>
                  <div>
                    <label>Qty stok-in</label>
                    <input
                      type="number"
                      value={row.qty}
                      disabled={bulkDisabled}
                      onChange={(e) =>
                        setBulkItems((arr) =>
                          arr.map((r, i) => (i === idx ? { ...r, qty: e.target.value } : r))
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label>Harga</label>
                    <input
                      type="number"
                      value={row.harga}
                      disabled={bulkDisabled}
                      onChange={(e) =>
                        setBulkItems((arr) =>
                          arr.map((r, i) => (i === idx ? { ...r, harga: e.target.value } : r))
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label>Tipe Harga</label>
                    <select
                      className={styles.coloredSelect}
                      value={row.priceType}
                      disabled={bulkDisabled}
                      onChange={(e) => {
                        const next = e.target.value as "per_satuan" | "per_pack";
                        setBulkItems((arr) =>
                          arr.map((r, i) => {
                            if (i !== idx) return r;
                            if (r.unitQty === "satuan" && next === "per_pack") {
                              return { ...r, priceType: "per_satuan" };
                            }
                            return { ...r, priceType: next };
                          })
                        );
                      }}
                    >
                      <option value="per_satuan">Per satuan</option>
                      <option value="per_pack">Per pack</option>
                    </select>
                  </div>
                  {bulkItems.length > 1 ? (
                    <button
                      type="button"
                      className={styles.bulkRemove}
                      disabled={bulkDisabled}
                      onClick={() => setBulkItems((arr) => arr.filter((_, i) => i !== idx))}
                    >
                      Hapus
                    </button>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                className={styles.bulkAddBtn}
                style={{ background: "var(--white)", color: "var(--navy)", border: "1px solid var(--navy)" }}
                disabled={bulkDisabled}
                onClick={() =>
                  setBulkItems((arr) => [
                    ...arr,
                    {
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
                      qty: "",
                      harga: "",
                    },
                  ])
                }
              >
                + Item
              </Button>
            </>
          )}
          <Button onClick={submitNewItem} style={{ background: "var(--navy)", color: "var(--white)", border: "1px solid var(--navy)" }}>
            Simpan
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!supplierModalItem}
        title={supplierModalItem ? `Hubungi Supplier untuk: ${supplierModalItem.name}` : "Hubungi Supplier"}
        onClose={() => setSupplierModalItem(null)}
      >
        <div className={styles.modalForm}>
          <label>Pesan</label>
          <textarea value={supplierMessage} onChange={(e) => setSupplierMessage(e.target.value)} rows={4} />

          <div className={styles.searchRow}>
            <label htmlFor="supplier-search">Cari supplier (nama / keperluan)</label>
            <div className={styles.searchInputWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                id="supplier-search"
                value={supplierQuery}
                onChange={(e) => setSupplierQuery(e.target.value)}
                placeholder="Cari supplier, keperluan, atau alamat"
              />
            </div>
          </div>

          <div className={styles.muted} style={{ marginTop: 6 }}>
            Supplier rekomendasi
          </div>
          <div className={`${styles.supplierList} ${styles.supplierTableWrap}`}>
            {suppliersError ? <div className={styles.muted}>{suppliersError}</div> : null}
            {suppliersLoading ? <div className={styles.muted}>Memuat supplier...</div> : null}
            {!suppliersLoading && supplierModalItem && suppliers.length ? (
              <table className={styles.supplierTable}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Keperluan/Deskripsi</th>
                    <th>Kontak</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => {
                    const base = sanitizePhone(s.waNumber || "");
                    const msg = encodeURIComponent(supplierMessage || `Permisi, min. Barang ${supplierModalItem.name} masih ready?`);
                    const wa = base ? `https://wa.me/${base}?text=${msg}` : null;
                    return (
                      <tr key={s.id}>
                        <td className={styles.supplierName}>{s.name || "-"}</td>
                        <td className={styles.supplierMeta}>{s.keywords.join(", ") || "Tidak ada deskripsi"}</td>
                        <td>
                          {wa ? (
                            <a className={styles.supplierBtn} href={wa} target="_blank" rel="noreferrer">
                              Hubungi
                            </a>
                          ) : (
                            <span className={styles.muted}>Nomor WA belum ada</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : null}
            {!suppliersLoading && supplierModalItem && !suppliers.length && !suppliersError ? (
              <div className={styles.muted}>
                Belum ada supplier cocok.
                <Button
                  className={styles.supplierAllBtn}
                  onClick={() => supplierModalItem && loadSuppliers(supplierModalItem, supplierQuery || "", true)}
                  disabled={suppliersLoading}
                >
                  Tampilkan semua supplier
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Hapus Item"
        onClose={() => {
          if (deleteLoading) return;
          setDeleteTarget(null);
        }}
      >
        <div className={styles.modalForm}>
          <div className={styles.modalConfirmText}>
            Hapus item {deleteTarget?.name || ""}?
          </div>
          <div className={styles.confirmActions}>
            <Button
              style={{ background: "#fff1f1", color: "var(--danger)", border: "1px solid #fecdd3" }}
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Menghapus..." : "Hapus"}
            </Button>
            <Button
              style={{ background: "var(--white)", color: "var(--navy)", border: "1px solid #cbd5e1" }}
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
            >
              Batal
            </Button>
          </div>
        </div>
      </Modal>

{/* Floating action menu (portal) */}
{actionMenu && typeof document !== "undefined"
  ? createPortal(
      <>
        <div className={styles.menuOverlay} onClick={() => setActionMenu(null)} />
        <div
          className={`${styles.dropdown} ${actionMenu.dir === "up" ? styles.dropdownUp : ""}`}
          style={{ left: actionMenu.left, top: actionMenu.top }}
          role="menu"
        >
          <button
            onClick={() => {
              setActionMenu(null);
              openStockModal(actionMenu.item);
            }}
          >
            Tambah Stok
          </button>
          {actionMenu.item.statusRefill !== "Aman" ? (
            <button
              onClick={() => {
                setActionMenu(null);
                openContactModal(actionMenu.item);
              }}
            >
              Hubungi
            </button>
          ) : null}
          <button
            onClick={() => {
              setActionMenu(null);
              startEdit(actionMenu.item);
            }}
          >
            Edit
          </button>
          <button
            onClick={() => {
              setActionMenu(null);
              router.push(`/items/${actionMenu.item.id}/riwayat`);
            }}
          >
            Riwayat
          </button>
          <button
            onClick={() => {
              setActionMenu(null);
              softDelete(actionMenu.item);
            }}
            style={{ color: "var(--danger)" }}
          >
            Hapus
          </button>
        </div>
      </>,
      document.body
    )
  : null}

    </div>
  );
}
