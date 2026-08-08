import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

export const BUCKET = process.env.R2_BUCKET_NAME ?? "fasesport-media";
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const WEBP_QUALITY = 80;

export async function convertToWebP(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (mimeType === "image/webp") {
    return { buffer, mimeType };
  }

  const webp = await sharp(buffer).webp({ quality: WEBP_QUALITY }).toBuffer();
  return { buffer: webp, mimeType: "image/webp" };
}

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
) {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: new Uint8Array(body),
      ContentType: contentType,
    })
  );

  return `${process.env.NEXT_PUBLIC_R2_URL}/${key}`;
}

export async function deleteFromR2(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function streamFromR2(key: string): Promise<ReadableStream | null> {
  const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return (res.Body as ReadableStream | undefined) ?? null;
}

export function r2KeyFromUrl(url: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_R2_URL;
  if (!baseUrl) return null;
  return url.startsWith(`${baseUrl}/`) ? url.slice(baseUrl.length + 1) : null;
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
  const fileUrl = `${process.env.NEXT_PUBLIC_R2_URL}/${key}`;

  return { uploadUrl, fileUrl, key };
}
