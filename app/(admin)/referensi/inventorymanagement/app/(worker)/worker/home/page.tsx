"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PicklistCard = {
  id: string;
  code: string;
  title: string;
  status: string;
  neededAt?: string;
  progressDone: number;
  progressTotal: number;
  shortage: number;
};

export default function WorkerHome() {
  const [me, setMe] = useState<{ employeeId: string; name: string } | null>(null);
  const [active, setActive] = useState<PicklistCard[]>([]);
  const [handoverNeeded, setHandoverNeeded] = useState<PicklistCard[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await fetch("/api/worker/me");
        if (userRes.ok) setMe((await userRes.json()).data);
        const res = await fetch("/api/worker/picklists?tab=active");
        if (res.ok) {
          const data = (await res.json()).data || [];
          setActive(data.slice(0, 3));
          setHandoverNeeded(data.filter((d: PicklistCard) => d.status === "PICKED"));
        }
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/worker/login";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fb", padding: "12px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 800, color: "#0b1b3a" }}>{me ? `${me.employeeId} • ${me.name}` : "Worker"}</div>
        <Button style={{ background: "#0b1b3a", color: "#fff" }} onClick={logout}>
          Logout
        </Button>
      </header>

      <section style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 8, color: "#0b1b3a" }}>Tugas Aktif</div>
        <div style={{ display: "grid", gap: 10 }}>
          {active.length === 0 ? (
            <Card>Tidak ada tugas aktif.</Card>
          ) : (
            active.map((p) => (
              <Card key={p.id} style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 800, color: "#0b1b3a" }}>{p.code}</div>
                  <span style={{ fontWeight: 700, color: "#0b1b3a" }}>{p.status}</span>
                </div>
                <div style={{ color: "#5b667a" }}>{p.title}</div>
                <div style={{ color: "#5b667a", fontSize: "0.9rem" }}>{p.neededAt ? `Butuh: ${p.neededAt}` : ""}</div>
                <div style={{ height: 8, background: "#e5e7eb", borderRadius: 999 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(p.progressDone / Math.max(1, p.progressTotal)) * 100}%`,
                      background: "#d4af37",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#5b667a" }}>
                    {p.progressDone}/{p.progressTotal}
                  </span>
                  {p.shortage > 0 ? <span style={{ color: "#dc2626", fontWeight: 700 }}>Shortage {p.shortage}</span> : null}
                </div>
                <Button
                  as="a"
                  href={`/worker/picklists/${p.id}`}
                  style={{ background: "#d4af37", color: "#0b1b3a", justifyContent: "center" }}
                >
                  {p.status === "READY" ? "Mulai Ambil" : "Lanjutkan"}
                </Button>
              </Card>
            ))
          )}
          <Link href="/worker/picklists" style={{ color: "#0b1b3a", fontWeight: 700 }}>
            Lihat semua
          </Link>
        </div>
      </section>

      {handoverNeeded.length > 0 ? (
        <section style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, color: "#0b1b3a" }}>Menunggu Serah Terima</div>
          <div style={{ display: "grid", gap: 10 }}>
            {handoverNeeded.map((p) => (
              <Card key={p.id} style={{ display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 800, color: "#0b1b3a" }}>{p.code}</div>
                <div style={{ color: "#5b667a" }}>{p.title}</div>
                <Button
                  as="a"
                  href={`/worker/handover/${p.id}`}
                  style={{ background: "#d4af37", color: "#0b1b3a", justifyContent: "center" }}
                >
                  Serah Terima
                </Button>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div style={{ fontWeight: 800, marginBottom: 8, color: "#0b1b3a" }}>Quick Actions</div>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
          <Button as="a" href="/worker/picklists" style={{ background: "#0b1b3a", color: "#fff", minHeight: 44 }}>
            Picklists
          </Button>
          <Button as="a" href="/worker/scan" style={{ background: "#0b1b3a", color: "#fff", minHeight: 44 }}>
            Scan Item
          </Button>
          <Button as="a" href="/worker/return" style={{ background: "#0b1b3a", color: "#fff", minHeight: 44 }}>
            Retur Sisa
          </Button>
          <Button as="a" href="/worker/history" style={{ background: "#0b1b3a", color: "#fff", minHeight: 44 }}>
            Riwayat
          </Button>
        </div>
      </section>
    </div>
  );
}
