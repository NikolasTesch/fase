import { expect, type Page } from "@playwright/test";

// Credenciais do seed (prisma/seed.ts usa ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD)
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL ?? "admin@fasesport.com";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? "fase2026";

export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.locator("input[name='email'], input[type='email']").fill(ADMIN_EMAIL);
  await page.locator("input[name='password'], input[type='password']").fill(ADMIN_PASSWORD);
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
}
