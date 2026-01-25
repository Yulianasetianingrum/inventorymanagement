import React from "react";

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export function Table({ children, style, ...props }: TableProps) {
  return (
    <table
      {...props}
      style={{
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        overflow: "hidden",
        ...(style as React.CSSProperties),
      }}
    >
      {children}
    </table>
  );
}
