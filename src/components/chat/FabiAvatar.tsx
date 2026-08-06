"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FabiAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showOnlineStatus?: boolean;
}

export function FabiAvatar({
  className,
  size = "md",
  showOnlineStatus = true,
}: FabiAvatarProps) {
  const sizeClasses = {
    sm: "size-7 text-xs",
    md: "size-10 text-sm",
    lg: "size-12 text-base",
  };

  const iconSizes = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold",
          "bg-gradient-to-br from-primary via-brand-dark to-accent text-primary-foreground",
          "shadow-md ring-2 ring-background",
          sizeClasses[size],
          className
        )}
        aria-label="Avatar da Fabi"
      >
        <Sparkles className={cn("animate-pulse text-amber-300", iconSizes[size])} />
      </div>

      {showOnlineStatus && (
        <span
          className="absolute right-0 bottom-0 size-3 rounded-full bg-emerald-500 ring-2 ring-background"
          title="Fabi Online"
        >
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        </span>
      )}
    </div>
  );
}
