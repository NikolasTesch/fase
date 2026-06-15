"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface HeroVideoUploaderProps {
  currentUrl: string | null;
}

export function HeroVideoUploader({ currentUrl }: HeroVideoUploaderProps) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/site-setting", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "instagram_hero_video_url",
          value: url,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-heading text-xl text-foreground">Vídeo Hero</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cole a URL do vídeo hospedado no R2 ou outra plataforma. O vídeo toca
        em loop automático na seção &ldquo;Viva sua nova fase&rdquo;.
      </p>
      <div className="mt-4 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
        >
          <Save className="size-4" />
          {saved ? "Salvo!" : "Salvar"}
        </button>
      </div>
      {url ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-muted-foreground">Preview:</p>
          <video
            src={url}
            controls
            className="aspect-video w-full max-w-sm rounded-lg bg-muted"
          />
        </div>
      ) : null}
    </div>
  );
}
