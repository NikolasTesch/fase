import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@fasesport.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  await page.goto("/admin/login");
  await page.locator("input[name='email'], input[type='email']").fill(adminEmail);
  await page.locator("input[name='password'], input[type='password']").fill(adminPassword);
  await page.locator("button[type='submit']").click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe("Admin — Produtos", () => {
  test("login T1 e lista produtos", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/produtos");

    await expect(page.getByText("Gestão de Catálogo")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Produtos");
    await expect(page.getByText(/Total de \d+ produto/)).toBeVisible();

    const editLinks = page.locator('main a[href^="/admin/produtos/"]', {
      hasText: "Editar",
    });
    await expect(editLinks.first()).toBeVisible();
  });

  test("cria produto básico", async ({ page }) => {
    const productName = `produto-e2e-${Date.now()}`;
    const slug = productName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    await loginAsAdmin(page);
    await page.goto("/admin/produtos/novo");

    await page.locator("#product-name").fill(productName);
    await expect(page.locator("#product-slug")).toHaveValue(slug);

    const categoryValue =
      (await page
        .locator("#product-category option")
        .evaluateAll((options) =>
          options.map((o) => (o as HTMLOptionElement).value).find((v) => v !== "")
        )) ?? "";
    test.skip(
      !categoryValue,
      "nenhuma categoria cadastrada — não é possível criar produto"
    );
    await page.locator("#product-category").selectOption(categoryValue);

    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(page.locator("h1")).toContainText("Editar produto", {
      timeout: 15000,
    });
    await expect(page).toHaveURL(/\/admin\/produtos\/.+/);
    await expect(page.locator("#product-name")).toHaveValue(productName);
  });

  test("paginação renderiza quando há mais de uma página", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/produtos?page=1");

    await expect(page.locator("h1")).toContainText("Produtos");

    const pagination = page.getByTestId("pagination");
    if (await pagination.count()) {
      const next = pagination.getByRole("link", { name: "Próxima página" });
      if (await next.count()) {
        await next.click();
        await expect(page).toHaveURL(/page=2/);
      }
    }
  });
});
