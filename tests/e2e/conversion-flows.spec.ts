import { test, expect } from "@playwright/test";

test.describe("Fluxo A — WhatsApp", () => {
  test("link WhatsApp contém wa.me com número", async ({ page }) => {
    await page.goto("/");

    const whatsAppLinks = page.locator(
      "a[href*='wa.me'], a[href*='api.whatsapp.com']"
    );
    await expect(whatsAppLinks.first()).toBeVisible();

    const href = await whatsAppLinks.first().getAttribute("href");
    expect(href).toMatch(/wa\.me\/\d+/);
  });

  test("navega homepage → categoria → produto e encontra link WhatsApp", async ({
    page,
  }) => {
    await page.goto("/");

    // Clica no primeiro link de categoria na nav desktop
    const categoryLinks = page.locator("header nav a");
    await expect(categoryLinks.first()).toBeVisible();
    await categoryLinks.first().click();

    // Aguarda página de categoria (URL muda)
    await page.waitForURL(/\/.+/);

    // Clica no primeiro produto do grid
    const productLinks = page
      .locator("main a[href]")
      .filter({ hasNot: page.locator("nav") });
    await productLinks.first().click();

    // Verifica link WhatsApp na página do produto
    const whatsAppBtn = page.locator(
      "a[href*='wa.me'], a[href*='api.whatsapp.com']"
    );
    await expect(whatsAppBtn.first()).toBeVisible();

    const href = await whatsAppBtn.first().getAttribute("href");
    expect(href).toMatch(/wa\.me\/\d+/);
  });
});

test.describe("Fluxo B — Formulário de Orçamento", () => {
  test("completa as 3 etapas do formulário e exibe tela de sucesso", async ({
    page,
  }) => {
    await page.goto("/orcamento");

    // Etapa 1 — Modalidade
    await expect(page.locator("h2").filter({ hasText: "Modalidade" })).toBeVisible();

    await page.locator("select#sport").selectOption("futebol");
    await page.locator("input#quantity").fill("20");
    await page.getByTestId("next-step").click();

    // Etapa 2 — Personalização
    await expect(page.locator("h2").filter({ hasText: "Personalização" })).toBeVisible();

    await page.locator("textarea#details").fill("Camisas vermelhas com número no dorso");
    await page.getByTestId("next-step").click();

    // Etapa 3 — Contato
    await expect(page.locator("h2").filter({ hasText: "Contato" })).toBeVisible();

    await page.locator("input#name").fill("Teste E2E");
    await page.locator("input#email").fill("teste@e2e.com");
    await page.locator("input#phone").fill("(27) 99999-9999");
    await page.locator("input#city").fill("Colatina");

    await page.getByTestId("submit-form").click();

    // Tela de sucesso
    await expect(page.getByTestId("form-success")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Responsividade Mobile (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("menu hambúrguer aparece e abre no mobile", async ({ page }) => {
    await page.goto("/");

    const hamburger = page.getByTestId("mobile-menu-button");
    await expect(hamburger).toBeVisible();

    await hamburger.click();

    // Nav do menu mobile aparece
    const mobileNav = page.locator("nav a").first();
    await expect(mobileNav).toBeVisible();
  });

  test("FAB WhatsApp está visível no mobile", async ({ page }) => {
    await page.goto("/");

    const fab = page
      .locator("a[href*='wa.me'], a[href*='api.whatsapp.com']")
      .first();
    await expect(fab).toBeVisible();
  });
});
