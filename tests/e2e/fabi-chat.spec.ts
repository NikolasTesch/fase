import { test, expect } from "@playwright/test";

async function openFabiChat(page: any) {
  await page.goto("/");
  // Fecha o banner de cookies se estiver visível
  const acceptCookies = page.getByRole("button", { name: /aceitar|concordar/i }).first();
  if (await acceptCookies.isVisible().catch(() => false)) {
    await acceptCookies.click().catch(() => {});
  }
  const fabiBtn = page.getByTestId("whatsapp-fab");
  await expect(fabiBtn).toBeVisible();
  await fabiBtn.click({ force: true });
}

test.describe("Assistente Virtual Fabi AI — Chat E2E", () => {
  test("deve abrir o modal do chat Fabi ao clicar no botão flutuante", async ({ page }) => {
    await openFabiChat(page);

    // Modal do chat deve abrir com a mensagem de boas-vindas
    const chatModal = page.locator("div").filter({ hasText: "Fabi" }).first();
    await expect(chatModal).toBeVisible();
    await expect(page.getByText("sua assistente virtual")).toBeVisible();
  });

  test("deve interagir via chips de pergunta rápida e receber resposta", async ({ page }) => {
    await openFabiChat(page);

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
    await openFabiChat(page);

    // Digita no input do chat
    const chatInput = page.getByPlaceholder("Digite sua dúvida para a Fabi...");
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
