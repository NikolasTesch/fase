import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

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
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
  // O AWS SDK v3 no Vercel recebe SharedArrayBuffer ao invés de ArrayBuffer
  // quando um Buffer Node.js é passado diretamente — Uint8Array força um ArrayBuffer regular
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
