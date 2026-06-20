import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export default function Card({
  children,
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  const baseClass = "glass-card";
  const interactiveProps = interactive
    ? {
        role: "button",
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            props.onClick?.(e as any);
          }
        },
      }
    : {};

  return (
    <div className={`${baseClass} ${className}`} {...interactiveProps} {...props}>
      {children}
    </div>
  );
}
