import React from "react";

type ButtonProps = (
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement>
) & {
  as?: "button" | "a";
  href?: string;
};

export function Button({ as = "button", href, children, style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    padding: "0.6rem 1.2rem",
    borderRadius: "0.75rem",
    border: "1px solid #e5e7eb",
    background: "#111827",
    color: "#fff",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    textDecoration: "none",
    cursor: "pointer",
  };

  if (as === "a") {
    const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} {...anchorProps} style={{ ...baseStyle, ...(style as React.CSSProperties) }}>
        {children}
      </a>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={buttonProps.type ?? "button"}
      {...buttonProps}
      style={{ ...baseStyle, ...(style as React.CSSProperties) }}
    >
      {children}
    </button>
  );
}
