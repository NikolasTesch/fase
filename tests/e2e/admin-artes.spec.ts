import path from "node:path";
import { test, expect, type Page } from "@playwright/test";

const r2Configured = Boolean(
  process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ACCOUNT_ID
);

const PREVIEW_FIXTURE = path.join(__dirname, "..", "fixtures", "preview.png");
const ORIGINAL_FIXTURE = path.join(__dirname, "..", "fixtures", "arte.cdr");

async function loginAsAdmin(page: Page) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@fasesport.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  await page.goto("/admin/login");
  await page.locator("input[name='email'], input[type='email']").fill(adminEmail);
  await page.locator("input[name='password'], input[type='password']").fill(adminPassword);
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe("Admin — Artes", () => {
  // Compartilham estado (banco/R2): o teste de upload cria e remove uma arte,
  // então o estado vazio precisa ser verificado antes, em ordem.
  test.describe.configure({ mode: "serial" });

  test("página de artes mostra estado vazio sem artes", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/artes");

    await expect(page.getByText("Biblioteca de Artes")).toBeVisible();
    await expect(page.getByText("Nenhum produto possui arte atrelada.")).toBeVisible();
  });

  test("upload + download de arte em produto existente", async ({ page }) => {
    test.skip(!r2Configured, "R2 não configurado — pulando fluxo de arte real");

    await loginAsAdmin(page);
    await page.goto("/admin/produtos");

    await page
      .locator('main a[href^="/admin/produtos/"]', { hasText: "Editar" })
      .first()
      .click();
    await expect(page.locator("#art-preview-file")).toBeVisible();

    await page.locator("#art-preview-file").setInputFiles(PREVIEW_FIXTURE);
    await page.locator("#art-original-file").setInputFiles(ORIGINAL_FIXTURE);
    await page.getByRole("button", { name: "Enviar arte" }).click();

    await expect(page.getByText("Arte do produto")).toBeVisible({ timeout: 10000 });

    const [downloadResponse] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/admin/products/art/") &&
          r.url().endsWith("/download") &&
          r.status() === 200
      ),
      page.locator('a[href*="/download"]').first().click(),
    ]);
    expect(downloadResponse.status()).toBe(200);

    // O clique no link pode ter disparado download/navegação — volta para a listagem
    await page.goto("/admin/produtos");
    await page
      .locator('main a[href^="/admin/produtos/"]', { hasText: "Editar" })
      .first()
      .click();
    await expect(page.getByText("Arte do produto")).toBeVisible();

    await page.getByRole("button", { name: "Remover arte" }).click();
    await page.getByRole("button", { name: "Remover", exact: true }).click();
    await expect(page.locator("#art-preview-file")).toBeVisible();
  });
});
