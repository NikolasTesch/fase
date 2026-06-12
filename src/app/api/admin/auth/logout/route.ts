export async function POST() {
  const response = Response.json({ success: true });

  (response.headers as Headers).append(
    "Set-Cookie",
    "admin_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
  );

  return response;
}
