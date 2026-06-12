"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactSchema, type ContactInput } from "@/lib/validations/contact";
import { Button } from "@/components/ui/button";

const SPORTS = [
  { value: "futebol", label: "Futebol" },
  { value: "volei", label: "Vôlei" },
  { value: "basquete", label: "Basquete" },
  { value: "handebol", label: "Handebol" },
  { value: "passeio", label: "Passeio / Comissão" },
  { value: "agasalho", label: "Agasalho" },
  { value: "colete", label: "Colete" },
  { value: "acessorios", label: "Acessórios" },
] as const;

const STEPS = ["Modalidade", "Personalização", "Contato"] as const;

interface OrcamentoFormProps {
  defaultSport?: ContactInput["sport"];
  defaultProductSlug?: string;
}

export function OrcamentoForm({ defaultSport, defaultProductSlug }: OrcamentoFormProps) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      sport: defaultSport,
      productSlug: defaultProductSlug,
      source: "form",
    },
  });

  async function advance() {
    const fields: (keyof ContactInput)[][] = [
      ["sport", "quantity"],
      ["details"],
      ["name", "email", "phone", "city"],
    ];

    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  }

  async function onSubmit(data: ContactInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setServerError(json.message ?? "Erro ao enviar. Tente novamente.");
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError("Erro de conexão. Verifique sua internet e tente novamente.");
    }
  }

  if (submitted) {
    return (
      <div data-testid="form-success" className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Orçamento enviado!</h2>
        <p className="text-muted-foreground">
          Recebemos sua solicitação. Nossa equipe entrará em contato em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Indicador de steps */}
      <ol className="flex gap-2 mb-8">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1 text-center text-sm">
            <span
              className={`block w-6 h-6 rounded-full mx-auto mb-1 text-xs leading-6 font-medium ${
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>
              {label}
            </span>
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="sport" className="block text-sm font-medium mb-1">
                Modalidade *
              </label>
              <select
                id="sport"
                {...register("sport")}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione...</option>
                {SPORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.sport && (
                <p className="text-destructive text-xs mt-1">{errors.sport.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                Quantidade aproximada
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                {...register("quantity", { valueAsNumber: true })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ex: 20"
              />
              {errors.quantity && (
                <p className="text-destructive text-xs mt-1">{errors.quantity.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="details" className="block text-sm font-medium mb-1">
                Detalhes da personalização
              </label>
              <textarea
                id="details"
                {...register("details")}
                rows={5}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Descreva cores, estampas, número de jogadores, modelo de interesse..."
              />
              {errors.details && (
                <p className="text-destructive text-xs mt-1">{errors.details.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nome *
              </label>
              <input
                id="name"
                {...register("name")}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Seu nome completo"
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                E-mail *
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Telefone / WhatsApp *
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="(27) 99999-9999"
              />
              {errors.phone && (
                <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                Cidade
              </label>
              <input
                id="city"
                {...register("city")}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Sua cidade"
              />
            </div>

            {serverError && (
              <p className="text-destructive text-sm">{serverError}</p>
            )}
          </div>
        )}

        {/* Navegação */}
        <div className="flex justify-between mt-8">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Voltar
            </Button>
          )}

          {step < 2 ? (
            <Button
              type="button"
              data-testid="next-step"
              onClick={advance}
              className="ml-auto"
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="submit"
              data-testid="submit-form"
              disabled={isSubmitting}
              className="ml-auto"
            >
              {isSubmitting ? "Enviando..." : "Enviar orçamento"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
