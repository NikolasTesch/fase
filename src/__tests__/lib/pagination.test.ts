import { describe, it, expect } from "vitest";
import { computePageRange } from "@/lib/pagination";

describe("computePageRange", () => {
  it("retorna pageCount 1 e offset 0 quando não há registros", () => {
    const res = computePageRange(0, 1, 24);
    expect(res.page).toBe(1);
    expect(res.pageCount).toBe(1);
    expect(res.offset).toBe(0);
  });

  it("calcula pageCount 2 para 25 registros com pageSize 24", () => {
    const res = computePageRange(25, 1, 24);
    expect(res.pageCount).toBe(2);
    expect(res.offset).toBe(0);
  });

  it("clampa página acima do limite para a última página", () => {
    const res = computePageRange(25, 3, 24);
    expect(res.page).toBe(2);
    expect(res.pageCount).toBe(2);
    expect(res.offset).toBe(24);
  });

  it("clampa página 0 para 1", () => {
    const res = computePageRange(25, 0, 24);
    expect(res.page).toBe(1);
    expect(res.offset).toBe(0);
  });

  it("calcula offset correto para a página 2", () => {
    const res = computePageRange(50, 2, 24);
    expect(res.page).toBe(2);
    expect(res.pageCount).toBe(3);
    expect(res.offset).toBe(24);
  });
});
