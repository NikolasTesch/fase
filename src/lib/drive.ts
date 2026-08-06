import { google } from "googleapis";

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON não configurada");
  return JSON.parse(raw) as Record<string, unknown>;
}

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
}

export const ARTS_FOLDER_ID = process.env.GOOGLE_DRIVE_ARTS_FOLDER_ID ?? "";

export async function uploadArtFile(buffer: Buffer, name: string, mimeType: string): Promise<string> {
  if (!ARTS_FOLDER_ID) throw new Error("GOOGLE_DRIVE_ARTS_FOLDER_ID não configurada");
  const drive = google.drive({ version: "v3", auth: getAuth() });
  const res = await drive.files.create({
    requestBody: { name, mimeType, parents: [ARTS_FOLDER_ID] },
    media: { mimeType, body: buffer },
  });
  return res.data.id!;
}

export async function streamDriveFile(fileId: string): Promise<ReadableStream | NodeJS.ReadableStream> {
  const drive = google.drive({ version: "v3", auth: getAuth() });
  const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
  return res.data as unknown as NodeJS.ReadableStream;
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const drive = google.drive({ version: "v3", auth: getAuth() });
  await drive.files.delete({ fileId });
}
