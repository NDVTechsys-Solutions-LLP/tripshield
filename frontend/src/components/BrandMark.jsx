import React from "react";

export function TripShieldMark({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="TripShield"
    >
      <path d="M12 2 4 5v6c0 5 3.5 8.6 8 11 4.5-2.4 8-6 8-11V5l-8-3z" />
      <path d="m8.5 12 2.3 2.3L15.5 9.5" />
    </svg>
  );
}
