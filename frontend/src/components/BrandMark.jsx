import React from "react";
import tripshieldMark from "@/assets/tripshield-mark.png";
import tripshieldMarkBlue from "@/assets/tripshield-mark-blue.png";
import tripshieldLogo from "@/assets/tripshield-logo.png";

/**
 * TripShield Mark — Official shield with winding road & map pin.
 * Transparent background, optimized for dark automotive theme.
 */
export function TripShieldMark({
  size = 28,
  variant = "default",
  className = "",
  glow = true,
  style = {},
  alt = "TripShield",
  ...props
}) {
  const isDealer = variant === "dealer" || variant === "blue";
  const src = isDealer ? tripshieldMarkBlue : tripshieldMark;

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block select-none pointer-events-none object-contain transition-all duration-200 ${
        glow
          ? isDealer
            ? "drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            : "drop-shadow-[0_0_10px_rgba(230,0,18,0.45)]"
          : ""
      } ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
        maxWidth: "100%",
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
      loading="eager"
      decoding="async"
      {...props}
    />
  );
}

/**
 * TripShield Full Logo — Official shield mark + bold "TripShield" wordmark.
 * Transparent background with subtle automotive ambient glow.
 */
export function TripShieldLogo({
  height = 34,
  className = "",
  glow = true,
  style = {},
  alt = "TripShield",
  ...props
}) {
  return (
    <img
      src={tripshieldLogo}
      alt={alt}
      height={height}
      className={`inline-block select-none pointer-events-none object-contain transition-all duration-200 ${
        glow ? "drop-shadow-[0_2px_12px_rgba(230,0,18,0.35)]" : ""
      } ${className}`}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: "auto",
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
      loading="eager"
      decoding="async"
      {...props}
    />
  );
}

