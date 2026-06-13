"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { ContactSchema, type ContactInput } from "@/lib/validations/contact";
import { buildWhatsAppUrl } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

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

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function OrcamentoForm({
  defaultSport,
  defaultProductSlug,
}: OrcamentoFormProps) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      sport: defaultSport,
      productSlug: defaultProductSlug,
      source: "form",
    },
  });

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  const phoneReg = { ...register("phone") };
  delete (phoneReg as { onChange?: unknown }).onChange;

  async function advance() {
    const fields: (keyof ContactInput)[][] = [
      ["sport", "quantity"],
      ["details"],
      ["name", "email", "phone", "city"],
    ];

    const valid = await trigger(fields[step]);
    if (valid) {
      setStep((s) => {
        const next = s + 1;
        trackEvent("orcamento_step", { step: next });
        return next;
      });
    }
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

      trackEvent("lead_submit", { sport: data.sport, source: "form" });
      setSubmitted(true);
    } catch {
      setServerError(
        "Erro de conexão. Verifique sua internet e tente novamente."
      );
    }
  }

  if (submitted) {
    return (
      <div data-testid="form-success" className="text-center py-12">
        <h2 className="text-2xl mb-2">Orçamento enviado!</h2>
        <p className="text-muted-foreground">
          Recebemos sua solicitação. Nossa equipe entrará em contato em breve.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Voltar à home
          </Link>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants()}
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <ol className="flex gap-2 mb-8">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1 text-center text-sm">
            <span
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                i < step && "bg-primary text-primary-foreground",
                i === step && "bg-background text-primary ring-2 ring-primary",
                i > step && "bg-muted text-muted-foreground opacity-50"
              )}
            >
              {i < step ? <Check size={12} aria-hidden="true" /> : i + 1}
            </span>
            <span
              className={
                i <= step ? "text-foreground" : "text-muted-foreground"
              }
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {step === 0 && (
          <div className="space-y-4">
            <h2
              ref={stepHeadingRef}
              tabIndex={-1}
              className="text-xl font-semibold outline-none"
            >
              Modalidade
            </h2>
            <div>
              <label htmlFor="sport" className="block text-sm font-medium mb-1">
                Modalidade *
              </label>
              <select
                id="sport"
                {...register("sport")}
                aria-invalid={errors.sport ? "true" : undefined}
                aria-describedby={errors.sport ? "sport-error" : undefined}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.sport ? "border-destructive" : "border-border"
                )}
              >
                <option value="">Selecione...</option>
                {SPORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.sport && (
                <p
                  id="sport-error"
                  role="alert"
                  className="text-destructive text-xs mt-1"
                >
                  {errors.sport.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium mb-1"
              >
                Quantidade aproximada
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                {...register("quantity", { valueAsNumber: true })}
                aria-invalid={errors.quantity ? "true" : undefined}
                aria-describedby={
                  errors.quantity ? "quantity-error" : undefined
                }
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.quantity ? "border-destructive" : "border-border"
                )}
                placeholder="Ex: 20"
              />
              {errors.quantity && (
                <p
                  id="quantity-error"
                  role="alert"
                  className="text-destructive text-xs mt-1"
                >
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2
              ref={stepHeadingRef}
              tabIndex={-1}
              className="text-xl font-semibold outline-none"
            >
              Personalização
            </h2>
            <div>
              <label
                htmlFor="details"
                className="block text-sm font-medium mb-1"
              >
                Detalhes da personalização
              </label>
              <textarea
                id="details"
                {...register("details")}
                rows={5}
                aria-invalid={errors.details ? "true" : undefined}
                aria-describedby={errors.details ? "details-error" : undefined}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none",
                  errors.details ? "border-destructive" : "border-border"
                )}
                placeholder="Descreva cores, estampas, número de jogadores, modelo de interesse..."
              />
              {errors.details && (
                <p
                  id="details-error"
                  role="alert"
                  className="text-destructive text-xs mt-1"
                >
                  {errors.details.message}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2
              ref={stepHeadingRef}
              tabIndex={-1}
              className="text-xl font-semibold outline-none"
            >
              Contato
            </h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nome *
              </label>
              <input
                id="name"
                {...register("name")}
                aria-invalid={errors.name ? "true" : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.name ? "border-destructive" : "border-border"
                )}
                placeholder="Seu nome completo"
              />
              {errors.name && (
                <p
                  id="name-error"
                  role="alert"
                  className="text-destructive text-xs mt-1"
                >
                  {errors.name.message}
                </p>
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
                aria-invalid={errors.email ? "true" : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.email ? "border-destructive" : "border-border"
                )}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-destructive text-xs mt-1"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Telefone / WhatsApp *
              </label>
              <input
                id="phone"
                type="tel"
                {...phoneReg}
                onChange={(e) => {
                  const masked = maskPhone(e.target.value);
                  setValue("phone", masked, { shouldValidate: true });
                }}
                aria-invalid={errors.phone ? "true" : undefined}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.phone ? "border-destructive" : "border-border"
                )}
                placeholder="(27) 99999-9999"
              />
              {errors.phone && (
                <p
                  id="phone-error"
                  role="alert"
                  className="text-destructive text-xs mt-1"
                >
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                Cidade
              </label>
              <input
                id="city"
                {...register("city")}
                aria-invalid={errors.city ? "true" : undefined}
                aria-describedby={errors.city ? "city-error" : undefined}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                  errors.city ? "border-destructive" : "border-border"
                )}
                placeholder="Sua cidade"
              />
              {errors.city && (
                <p
                  id="city-error"
                  role="alert"
                  className="text-destructive text-xs mt-1"
                >
                  {errors.city.message}
                </p>
              )}
            </div>

            {serverError && (
              <p role="alert" className="text-destructive text-sm">
                {serverError}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
            >
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
