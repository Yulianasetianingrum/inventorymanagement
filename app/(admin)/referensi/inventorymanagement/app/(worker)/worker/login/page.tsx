 "use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  missing: "Employee ID dan password wajib diisi.",
  unauthorized: "Employee ID atau password salah.",
  rate_limit: "Terlalu banyak percobaan. Coba lagi beberapa menit.",
  wrong_portal: "Anda login di halaman yang salah. Gunakan halaman Admin.",
};

export default function WorkerLoginPage({ searchParams }: PageProps) {
  const params = React.use(searchParams);
  const errorKey = params?.error ?? "";
  const error = errorMessages[errorKey];
  const [showPin, setShowPin] = React.useState(false);

  return (
    <main style={{ display: "grid", placeItems: "center", padding: "2rem" }}>
      <Card style={{ width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem", textAlign: "center" }}>Worker Login</h1>
        {error ? (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              marginBottom: "0.75rem",
            }}
            role="alert"
          >
            {error}
          </div>
        ) : null}
        {errorKey === "wrong_portal" ? (
          <Button
            as="a"
            href="/login"
            style={{
              textDecoration: "none",
              background: "#ffffff",
              color: "#0B1B3A",
              border: "1px solid #D4AF37",
              justifyContent: "center",
              width: "100%",
              marginBottom: "0.5rem",
            }}
          >
            Buka halaman Admin Login
          </Button>
        ) : null}
        <form
          method="post"
          action="/api/auth/login-worker"
          style={{ display: "grid", gap: "0.75rem", justifyItems: "stretch" }}
        >
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span>Employee ID</span>
            <input name="employeeId" required style={{ padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }} />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span>Password</span>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPin ? "text" : "password"}
                required
                style={{
                  padding: "0.6rem 2.5rem 0.6rem 0.6rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  width: "100%",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                aria-label={showPin ? "Sembunyikan password" : "Tampilkan password"}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#6b7280",
                  fontSize: "0.9rem",
                }}
              >
                {showPin ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <Button type="submit" style={{ width: "100%", justifyContent: "center" }}>
            Masuk
          </Button>
          <Button
            as="a"
            href="https://wa.me/6285175020319?text=Lupa%20ID%20atau%20PIN%20login%20worker"
            style={{
              textDecoration: "none",
              background: "#ffffff",
              color: "#0B1B3A",
              border: "1px solid #D4AF37",
              justifyContent: "center",
              width: "100%",
            }}
          >
            Lupa ID / PIN? Hubungi Admin
          </Button>
        </form>
      </Card>
    </main>
  );
}
