"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

export function RouteChangeTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", { page_path: pathname });
  }, [pathname]);

  return null;
}
