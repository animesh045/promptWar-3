import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "info";
  children: React.ReactNode;
}

export default function Badge({
  variant = "info",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const baseClass = "badge";
  const variantClass =
    variant === "success"
      ? "badge-eco-success"
      : variant === "warning"
      ? "badge-eco-warning"
      : "badge-eco-info";
  return (
    <span className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
