import { z } from "zod";

export const ArtSchema = z.object({
  name: z.string().min(2).max(100),
});

export const ART_PREVIEW_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
export const ART_ORIGINAL_EXTENSIONS = ["cdr", "svg", "pdf", "ai", "eps", "png", "jpg", "jpeg", "webp", "gif"] as const;
export const ART_MAX_ORIGINAL_SIZE = 100 * 1024 * 1024; // 100 MB
export const ART_MAX_PREVIEW_SIZE = 25 * 1024 * 1024; // 25 MB
