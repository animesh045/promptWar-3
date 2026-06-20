import React from "react";

interface ProgressBarProps {
  value: number; // percentage (0-100)
  max?: number;
  className?: string;
  fillClassName?: string;
  ariaLabel?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  className = "",
  fillClassName = "",
  ariaLabel = "Progress"
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  return (
    <div
      className={`bar-track ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className={`bar-fill ${fillClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
