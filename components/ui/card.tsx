import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, style, className, ...props }: CardProps) {
  return (
    <div
      className={className}
      {...props}
      style={style}
    >
      {children}
    </div>
  );
}
