import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";
import {
  PhoneChatIcon,
  JerseyIcon,
  PaymentIcon,
  SewingMachineIcon,
  CalendarCheckIcon,
  DeliveryTruckIcon,
} from "@/components/ui/icons";
import { buildWhatsAppUrl, getSimulatorUrl } from "@/lib/site";

interface StepItem {
  stepNumber: string;
  title: string;
  description: string;
  link?: string;
  actionText?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const PROCESS_STEPS: StepItem[] = [
  {
    stepNumber: "01",
    title: "Solicite o Atendimento",
    description:
      "Inicie o contato com nossa equipe comercial pelo WhatsApp para tirar dúvidas e alinhar seu pedido.",
    link: "whatsapp",
    actionText: "Falar no WhatsApp",
    icon: PhoneChatIcon,
  },
  {
    stepNumber: "02",
    title: "Personalize seu Uniforme",
    description:
      "Escolha as cores, insira o escudo do seu time, patrocínios, nomes e números de forma personalizada.",
    link: "simulator",
    actionText: "Ir para o Simulador",
    icon: JerseyIcon,
  },
  {
    stepNumber: "03",
    title: "Escolha a Forma de Pagamento",
    description:
      "Facilitamos o pagamento com opções flexíveis de sinal + saldo na entrega ou parcelamento.",
    icon: PaymentIcon,
  },
  {
    stepNumber: "04",
    title: "Autorize o Início da Produção",
    description:
      "Após aprovar o layout final em 3D e confirmar os tamanhos, iniciamos a confecção dos mantos.",
    icon: SewingMachineIcon,
  },
  {
    stepNumber: "05",
    title: "Espere os Prazos Estipulados",
    description:
      "Nossa fábrica trabalha com cronograma rígido para entregar seus uniformes dentro do prazo acordado.",
    icon: CalendarCheckIcon,
  },
  {
    stepNumber: "06",
    title: "O Produto Chegará em seu Destino",
    description:
      "Enviamos para todo o Brasil com segurança ou disponibilizamos retirada física em Teixeira de Freitas-BA.",
    icon: DeliveryTruckIcon,
  },
];

export function ProcessSteps() {
  const whatsappUrl = buildWhatsAppUrl(
    "Olá Fase Sport! Gostaria de solicitar um orçamento."
  );
  const simulatorUrl = getSimulatorUrl();

  function resolveLink(step: StepItem): string | null {
    if (!step.link) return null;
    if (step.link === "whatsapp") return whatsappUrl;
    if (step.link === "simulator") return simulatorUrl;
    return step.link;
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-12 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">
            Como funciona o pedido
          </h2>
          <p className="mt-3 text-muted-foreground">
            Do primeiro contato à entrega em 6 etapas simples.
          </p>
        </RevealOnScroll>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {PROCESS_STEPS.map((step, i) => {
            const href = resolveLink(step);
            const isLast = i === PROCESS_STEPS.length - 1;

            return (
              <RevealOnScroll key={step.stepNumber} delay={i * 0.05} className="relative">
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 text-card-foreground shadow-sm ring-1 ring-black/[0.02] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-accent/20">
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <step.icon className="size-6" />
                    </span>
                    <span
                      className="font-heading text-3xl text-accent/20"
                      aria-hidden="true"
                    >
                      {step.stepNumber}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  {href && step.actionText ? (
                    <Link
                      href={href}
                      target={step.link === "whatsapp" ? "_blank" : undefined}
                      rel={step.link === "whatsapp" ? "noopener noreferrer" : undefined}
                      className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {step.actionText}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : null}
                </div>

                {/* SVG connector between steps (desktop) */}
                {!isLast ? (
                  <div
                    className="absolute -right-3 top-1/2 hidden -translate-y-1/2 xl:block"
                    aria-hidden="true"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent/40">
                      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : null}
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
