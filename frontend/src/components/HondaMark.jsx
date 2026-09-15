import React from "react";

export function HondaMark({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size * 0.62}
      viewBox="0 0 100 62"
      className={className}
      aria-label="Honda"
    >
      <path
        fill="currentColor"
        d="M12 4v18h20V4h12v54H32V36H12v22H0V4h12zM62 4l14 22V4h12v54H76L62 36v22H50V4h12z"
      />
    </svg>
  );
}
