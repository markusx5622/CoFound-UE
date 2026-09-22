import React from "react";

interface InitialsAvatarProps {
  name?: string;
  size?: number | string;
  className?: string;
}

export function getInitials(name?: string): string {
  if (!name || typeof name !== "string" || !name.trim()) {
    return "?";
  }
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "?";
  if (tokens.length === 1) {
    return tokens[0].charAt(0).toUpperCase();
  }
  const first = tokens[0].charAt(0).toUpperCase();
  const last = tokens[tokens.length - 1].charAt(0).toUpperCase();
  return `${first}${last}`;
}

export default function InitialsAvatar({
  name = "",
  size,
  className = "",
}: InitialsAvatarProps) {
  const initials = getInitials(name);

  const style: React.CSSProperties = size
    ? {
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }
    : {};

  return (
    <div
      style={style}
      aria-label={name ? `Avatar de ${name}` : "Avatar de usuario"}
      className={`rounded-full bg-zinc-800 border border-zinc-700 text-[#E60000] flex items-center justify-center font-bold shrink-0 select-none overflow-hidden ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
}
