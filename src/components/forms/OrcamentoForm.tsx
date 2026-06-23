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

const SPORT_LABELS: Record<string, string> = {
  futebol: "Futebol",
  volei: "Vôlei",
  basquete: "Basquete",
  handebol: "Handebol",
  passeio: "Passeio / Comissão",
  agasalho: "Agasalho",
  colete: "Colete",
  acessorios: "Acessórios",
};

function buildOrcamentoWhatsAppMessage(data: ContactInput): string {
  const lines = ["Olá, Fase Sport! Gostaria de solicitar um orçamento."];
  lines.push("");
  lines.push(`Nome: ${data.name}`);
  lines.push(`Telefone: ${data.phone}`);
  if (data.city) lines.push(`Cidade: ${data.city}`);
  lines.push(`Modalidade: ${SPORT_LABELS[data.sport] ?? data.sport}`);
  if (data.quantity) lines.push(`Quantidade: ${data.quantity} peça(s)`);
  if (data.details) lines.push(`Detalhes: ${data.details}`);
  if (data.productSlug) lines.push(`Produto de interesse: ${data.productSlug}`);
  return lines.join("\n");
}

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
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const isMounted = useRef(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      sport: defaultSport,
      productSlug: defaultProductSlug,
      source: "form",
    },
  });

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [step]);

  const phoneReg = { ...register("phone") };
  delete (phoneReg as { onChange?: unknown }).onChange;

  async function advance() {
    const fields: (keyof ContactInput)[][] = [
      ["sport", "quantity"],
      ["details"],
      ["name", "phone", "city"],
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

  function onSubmit(data: ContactInput) {
    trackEvent("lead_submit", { sport: data.sport, source: "form" });
    const message = buildOrcamentoWhatsAppMessage(data);
    const url = buildWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
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
      {/* Pill steps */}
      <div className="mb-8 flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-current={i === step ? "step" : undefined}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                  i < step && "bg-accent text-accent-foreground",
                  i === step && "bg-background text-accent ring-2 ring-accent",
                  i > step && "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check size={13} aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors duration-300",
                  i <= step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {/* Conector entre steps */}
            {i < STEPS.length - 1 ? (
              <div
                className={cn(
                  "mx-2 mt-[-1.25rem] h-px flex-1 transition-colors duration-500",
                  i < step ? "bg-accent" : "bg-border"
                )}
                aria-hidden="true"
              />
            ) : null}
          </div>
        ))}
      </div>

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
                    "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors duration-200",
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
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors duration-200",
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
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors duration-200",
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
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors duration-200",
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
                  "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors duration-200",
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
              variant="accent"
              className="ml-auto"
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="submit"
              data-testid="submit-form"
              variant="accent"
              className="ml-auto"
            >
              Solicitar orçamento no WhatsApp
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
