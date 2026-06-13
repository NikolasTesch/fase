"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { useEffect, useState } from "react";

import { RouteChangeTracker } from "@/components/analytics/RouteChangeTracker";

declare global {
  interface Window {
    __gtmInit?: () => void;
  }
}

interface AnalyticsProviderProps {
  initialConsent: boolean;
}

export function AnalyticsProvider({ initialConsent }: AnalyticsProviderProps) {
  const [loaded, setLoaded] = useState(initialConsent);
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  useEffect(() => {
    window.__gtmInit = () => setLoaded(true);
    return () => {
      window.__gtmInit = undefined;
    };
  }, []);

  if (!loaded || !gtmId) return null;

  return (
    <>
      <GoogleTagManager gtmId={gtmId} />
      <RouteChangeTracker />
    </>
  );
}
