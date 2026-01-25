import React from "react";
import { Card } from "./card";
import { Button } from "./button";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 40,
        padding: "12px",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <Card
        style={{
          minWidth: "320px",
          maxWidth: "640px",
          width: "min(90vw, 640px)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{title}</h2>
          {onClose ? (
            <Button type="button" onClick={onClose} aria-label="Close">
              Close
            </Button>
          ) : null}
        </div>
        <div style={{ marginTop: "1rem" }}>{children}</div>
      </Card>
    </div>
  );
}
