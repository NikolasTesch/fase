import { z } from "zod";

export const ArtUploadSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  tagIds: z.array(z.cuid()).default([]),
});

export const ArtUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
  tagIds: z.array(z.cuid()).optional(),
});

export const ArtTagSchema = z.object({
  name: z.string().min(2).max(50),
});

export const ART_PREVIEW_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const ART_ORIGINAL_EXTENSIONS = [
  "cdr",
  "svg",
  "pdf",
  "ai",
  "eps",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
] as const;

export const ART_MAX_ORIGINAL_SIZE = 20 * 1024 * 1024;
export const ART_MAX_PREVIEW_SIZE = 10 * 1024 * 1024;
