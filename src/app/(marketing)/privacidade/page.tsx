import type { Metadata } from "next";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SITE_CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade — Fase Sport",
  robots: { index: false },
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 lg:py-16">
      <Breadcrumb
        items={[{ label: "Início", href: "/" }, { label: "Política de Privacidade" }]}
      />

      <header className="mt-6 mb-10">
        <h1 className="font-heading text-3xl text-foreground lg:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualizado em junho de 2026
        </p>
      </header>

      <div className="space-y-10 text-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold">1. Quem somos</h2>
          <p className="text-muted-foreground">
            Fase Sport Artigos Esportivos — CNPJ [a preencher], com sede em{" "}
            {SITE_CONTACT.address}, {SITE_CONTACT.city}. Somos responsáveis pelo
            tratamento dos dados pessoais coletados neste site.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">2. Quais dados coletamos</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">a) Via formulário de orçamento:</strong>{" "}
              nome, e-mail, telefone, cidade, modalidade esportiva, quantidade
              aproximada e detalhes de personalização.
            </p>
            <p>
              <strong className="text-foreground">b) Via cookies e analytics</strong>{" "}
              (somente com seu consentimento): dados de navegação, tipo de
              dispositivo e geolocalização aproximada por IP.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">3. Por que coletamos</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">a) Orçamentos e contato comercial:</strong>{" "}
              para responder sua solicitação e viabilizar o atendimento (base legal:
              execução de contrato / legítimo interesse — Art. 7º, II e IX da
              LGPD).
            </p>
            <p>
              <strong className="text-foreground">b) Melhoria do site:</strong>{" "}
              para medir o desempenho e entender como os visitantes usam o site
              (base legal: consentimento — Art. 7º, I da LGPD).
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">4. Com quem compartilhamos</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Google LLC</strong> (Google
              Analytics 4) — somente com seu consentimento, para análise de tráfego.
            </li>
            <li>
              <strong className="text-foreground">Resend Inc.</strong> — envio de
              e-mail transacional de notificação interna.
            </li>
            <li>
              <strong className="text-foreground">Neon Inc.</strong> — banco de
              dados em nuvem (AWS us-east-1), onde os leads são armazenados com
              segurança.
            </li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            Não vendemos, alugamos nem cedemos seus dados a terceiros para fins
            comerciais.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">5. Por quanto tempo guardamos</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Leads e contatos: até 2 anos após o último contato ou até solicitação
              de exclusão.
            </li>
            <li>
              Dados de analytics: conforme a política do Google Analytics (retenção
              padrão de 14 meses).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">6. Seus direitos (LGPD)</h2>
          <p className="mb-3 text-muted-foreground">
            De acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018), você
            tem direito a:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Confirmação de que seus dados são tratados</li>
            <li>Acesso aos dados que temos sobre você</li>
            <li>Correção de dados incompletos ou incorretos</li>
            <li>Portabilidade dos dados para outro fornecedor</li>
            <li>Eliminação dos dados tratados com base em consentimento</li>
            <li>Revogação do consentimento a qualquer momento</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            Para exercer esses direitos, entre em contato pelo e-mail:{" "}
            <a
              href={`mailto:${SITE_CONTACT.email}`}
              className="text-primary underline underline-offset-4"
            >
              {SITE_CONTACT.email}
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">7. Cookies</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Cookie de sessão admin:</strong>{" "}
              httpOnly, 7 dias — usado apenas pelo painel administrativo interno.
            </li>
            <li>
              <strong className="text-foreground">Cookie de consentimento:</strong>{" "}
              salvo localmente por 30 dias para lembrar sua preferência.
            </li>
            <li>
              <strong className="text-foreground">Cookies do Google Analytics 4:</strong>{" "}
              carregados apenas se você aceitar cookies analíticos.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">8. Contato</h2>
          <p className="text-muted-foreground">
            Fase Sport — {SITE_CONTACT.address}, {SITE_CONTACT.city}.
            <br />
            E-mail:{" "}
            <a
              href={`mailto:${SITE_CONTACT.email}`}
              className="text-primary underline underline-offset-4"
            >
              {SITE_CONTACT.email}
            </a>
            <br />
            WhatsApp:{" "}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              className="text-primary underline underline-offset-4"
            >
              {SITE_CONTACT.whatsapp}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
