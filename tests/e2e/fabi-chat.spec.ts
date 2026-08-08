import { test, expect } from "@playwright/test";

test.describe("Assistente Virtual Fabi AI — Chat E2E", () => {
  test("deve abrir o modal do chat Fabi ao clicar no botão flutuante", async ({ page }) => {
    await page.goto("/");

    // Clica no botão flutuante da Fabi no canto da tela
    const fabiBtn = page.getByRole("button", { name: /fabi/i }).first();
    await expect(fabiBtn).toBeVisible();
    await fabiBtn.click();

    // Modal do chat deve abrir com a mensagem de boas-vindas
    const chatModal = page.locator("div").filter({ hasText: "Fabi" }).first();
    await expect(chatModal).toBeVisible();
    await expect(page.getByText("sua assistente virtual")).toBeVisible();
  });

  test("deve interagir via chips de pergunta rápida e receber resposta", async ({ page }) => {
    await page.goto("/");

    // Abre o chat da Fabi
    const fabiBtn = page.getByRole("button", { name: /fabi/i }).first();
    await fabiBtn.click();

    // Clica no chip de orçamento rápido
    const chip = page.getByRole("button", { name: /cotar 20 camisas/i });
    await expect(chip).toBeVisible();
    await chip.click();

    // Aguarda a resposta da assistente com o orçamento/valor unitário ou link do WhatsApp
    const assistantReply = page.locator("div").filter({ hasText: "Com certeza" }).first();
    await expect(assistantReply).toBeVisible({ timeout: 15000 });

    // Verifica que o botão 1-Clique para o WhatsApp foi renderizado
    const whatsAppBtn = page.getByRole("link", { name: /whatsapp/i }).first();
    await expect(whatsAppBtn).toBeVisible();
  });

  test("deve enviar mensagem de triagem e gerar link pré-preenchido para WhatsApp", async ({ page }) => {
    await page.goto("/");

    const fabiBtn = page.getByRole("button", { name: /fabi/i }).first();
    await fabiBtn.click();

    // Digita no input do chat
    const chatInput = page.getByPlaceholder("Digite sua mensagem...");
    await expect(chatInput).toBeVisible();
    await chatInput.fill("Meu nome é Carlos, quero cotar 15 conjuntos de ciclismo. Meu zap é (73) 99999-8888");

    const sendBtn = page.locator("button[type='submit']");
    await sendBtn.click();

    // Aguarda processamento do chat e exibição do card de WhatsApp
    const whatsAppCta = page.getByRole("link", { name: /whatsapp/i }).first();
    await expect(whatsAppCta).toBeVisible({ timeout: 15000 });

    const href = await whatsAppCta.getAttribute("href");
    expect(href).toContain("https://wa.me/");
  });
});
