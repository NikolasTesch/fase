import { test, expect } from "@playwright/test";

test.describe("Autenticação Admin", () => {
  test("rota /admin redireciona para /admin/login sem sessão", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("rota /admin/dashboard redireciona para /admin/login sem sessão", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("credenciais inválidas exibem mensagem de erro", async ({ page }) => {
    await page.goto("/admin/login");

    await page.locator("input[name='email'], input[type='email']").fill("invalido@teste.com");
    await page.locator("input[name='password'], input[type='password']").fill("senha_errada");
    await page.locator("button[type='submit']").click();

    await expect(
      page.locator("[role='alert'], p, span").filter({ hasText: /inválid|incorret|erro|unauthorized/i }).first()
    ).toBeVisible({ timeout: 5000 });

    // Deve permanecer na página de login
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login com credenciais válidas redireciona ao dashboard", async ({
    page,
  }) => {
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@fasesport.com";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

    await page.goto("/admin/login");

    await page.locator("input[name='email'], input[type='email']").fill(adminEmail);
    await page.locator("input[name='password'], input[type='password']").fill(adminPassword);
    await page.locator("button[type='submit']").click();

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 8000 });
  });
});
