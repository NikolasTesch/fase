import { describe, it, expect } from "vitest";
import { ContactSchema } from "@/lib/validations/contact";

const validInput = {
  name: "João Silva",
  email: "joao@example.com",
  phone: "27999998888",
  sport: "futebol" as const,
};

describe("ContactSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = ContactSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts a complete valid payload", () => {
    const result = ContactSchema.safeParse({
      ...validInput,
      city: "Colatina-ES",
      quantity: 20,
      details: "Camisas com escudo bordado",
      productSlug: "camisa-futebol-pro",
      source: "whatsapp",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(20);
      expect(result.data.source).toBe("whatsapp");
    }
  });

  it("defaults source to 'form' when omitted", () => {
    const result = ContactSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe("form");
    }
  });

  it("rejects an invalid sport (outside enum)", () => {
    const result = ContactSchema.safeParse({ ...validInput, sport: "natacao" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("sport"))).toBe(
        true,
      );
    }
  });

  it("rejects an invalid email", () => {
    const result = ContactSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("email"))).toBe(
        true,
      );
    }
  });

  it("rejects a name with fewer than 2 characters", () => {
    const result = ContactSchema.safeParse({ ...validInput, name: "J" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(
        true,
      );
    }
  });

  it("rejects a phone shorter than 10 chars", () => {
    const result = ContactSchema.safeParse({ ...validInput, phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer quantity", () => {
    const result = ContactSchema.safeParse({ ...validInput, quantity: 2.5 });
    expect(result.success).toBe(false);
  });
});
