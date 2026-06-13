// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrcamentoForm } from "@/components/forms/OrcamentoForm";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5527999999999";
  vi.stubGlobal("open", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("OrcamentoForm — Step 1 (Modalidade)", () => {
  it("renderiza Step 1 com campos de modalidade e quantidade", () => {
    render(<OrcamentoForm />);

    expect(screen.getByRole("heading", { name: /modalidade/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/modalidade \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
    expect(screen.getByTestId("next-step")).toBeInTheDocument();
  });

  it("bloqueia avanço quando sport não é selecionado", async () => {
    const user = userEvent.setup();
    render(<OrcamentoForm />);

    await user.click(screen.getByTestId("next-step"));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /modalidade/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("heading", { name: /personalização/i })
    ).not.toBeInTheDocument();
  });

  it("avança para Step 2 ao preencher sport válido", async () => {
    const user = userEvent.setup();
    render(<OrcamentoForm />);

    await user.selectOptions(screen.getByLabelText(/modalidade \*/i), "futebol");
    await user.clear(screen.getByLabelText(/quantidade/i));
    await user.type(screen.getByLabelText(/quantidade/i), "20");
    await user.click(screen.getByTestId("next-step"));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /personalização/i })
      ).toBeInTheDocument();
    });
  });
});

describe("OrcamentoForm — Step 2 (Personalização)", () => {
  async function chegarAoStep2() {
    const user = userEvent.setup();
    render(<OrcamentoForm />);

    await user.selectOptions(screen.getByLabelText(/modalidade \*/i), "futebol");
    await user.clear(screen.getByLabelText(/quantidade/i));
    await user.type(screen.getByLabelText(/quantidade/i), "20");
    await user.click(screen.getByTestId("next-step"));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /personalização/i })
      ).toBeInTheDocument()
    );

    return user;
  }

  it("avança para Step 3 a partir do Step 2", async () => {
    const user = await chegarAoStep2();

    await user.click(screen.getByTestId("next-step"));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /contato/i })
      ).toBeInTheDocument();
    });
  });
});

describe("OrcamentoForm — Step 3 (Contato) e submit", () => {
  async function chegarAoStep3() {
    const user = userEvent.setup();
    render(<OrcamentoForm />);

    // Step 1
    await user.selectOptions(screen.getByLabelText(/modalidade \*/i), "futebol");
    await user.clear(screen.getByLabelText(/quantidade/i));
    await user.type(screen.getByLabelText(/quantidade/i), "20");
    await user.click(screen.getByTestId("next-step"));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /personalização/i })
      ).toBeInTheDocument()
    );

    // Step 2
    await user.click(screen.getByTestId("next-step"));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /contato/i })
      ).toBeInTheDocument()
    );

    return user;
  }

  it("exibe os campos de contato no Step 3", async () => {
    await chegarAoStep3();

    expect(screen.getByLabelText(/nome \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
    expect(screen.getByTestId("submit-form")).toBeInTheDocument();
  });

  it("abre WhatsApp com os dados dos 3 steps e exibe tela de sucesso", async () => {
    const user = await chegarAoStep3();

    await user.type(screen.getByLabelText(/nome \*/i), "João Teste");
    await user.type(screen.getByLabelText(/telefone/i), "27999999999");
    await user.type(screen.getByLabelText(/cidade/i), "Teixeira de Freitas");

    await user.click(screen.getByTestId("submit-form"));

    await waitFor(() => {
      expect(screen.getByTestId("form-success")).toBeInTheDocument();
    });

    expect(window.open).toHaveBeenCalledOnce();
    const [url] = vi.mocked(window.open).mock.calls[0];
    expect(String(url)).toContain("wa.me/5527999999999");
    expect(String(url)).toContain("Jo%C3%A3o%20Teste");
    expect(String(url)).toContain("Futebol");
  });

  it("bloqueia submit sem nome preenchido", async () => {
    const user = await chegarAoStep3();

    await user.type(screen.getByLabelText(/telefone/i), "27999999999");
    await user.click(screen.getByTestId("submit-form"));

    await waitFor(() => {
      expect(screen.queryByTestId("form-success")).not.toBeInTheDocument();
    });

    expect(window.open).not.toHaveBeenCalled();
  });
});
