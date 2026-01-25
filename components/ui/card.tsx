import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, style, ...props }: CardProps) {
  return (
    <div
      {...props}
      style={{
        padding: "1rem",
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        background: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        ...(style as React.CSSProperties),
      }}
    >
      {children}
    </div>
  );
}
