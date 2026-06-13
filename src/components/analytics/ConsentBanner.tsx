"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface ConsentBannerProps {
  initialConsent: boolean;
}

const COOKIE_MAX_AGE = 2592000;

function setConsentCookie(value: boolean) {
  document.cookie = `fase_analytics_consent=${value}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; path=/`;
}

export function ConsentBanner({ initialConsent }: ConsentBannerProps) {
  const [hidden, setHidden] = useState(false);

  if (initialConsent || hidden) return null;

  function handleAccept() {
    setConsentCookie(true);
    window.__gtmInit?.();
    setHidden(true);
  }

  function handleReject() {
    setConsentCookie(false);
    setHidden(true);
  }

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-card px-4 py-4 text-card-foreground shadow-lg"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Usamos cookies para analisar o tráfego e melhorar sua experiência. Veja
          nossa{" "}
          <Link
            href="/privacidade"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Política de Privacidade
          </Link>
          . Você pode aceitar ou recusar a coleta de dados analíticos.
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="outline" onClick={handleReject}>
            Recusar
          </Button>
          <Button onClick={handleAccept}>Aceitar</Button>
        </div>
      </div>
    </div>
  );
}
