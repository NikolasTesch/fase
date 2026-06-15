"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useReducedMotion } from "framer-motion";

interface HeroVideoProps {
  src: string;
}

export function HeroVideo({ src }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldReduce = useReducedMotion();
  const [playing, setPlaying] = useState(!shouldReduce);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldReduce) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().catch(() => {});
    }
  }, [shouldReduce]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
      <video
        ref={videoRef}
        src={src}
        autoPlay={!shouldReduce}
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
        aria-label="Vídeo institucional Fase Sport"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
        className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
    </div>
  );
}
