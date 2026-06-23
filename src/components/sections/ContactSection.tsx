"use client";

import { Mail, MapPin, Phone } from "lucide-react";

import { OrcamentoForm } from "@/components/forms/OrcamentoForm";
import { RevealOnScroll } from "@/components/sections/RevealOnScroll";
import { SITE_CONTACT } from "@/lib/site";

function formatPhoneNumber(phone: string) {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 13 && clean.startsWith("55")) {
    return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  return phone;
}

export function ContactSection() {
  const mapUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=Fase+Sport,Teixeira+de+Freitas+BA`
    : "https://maps.google.com/maps?q=Av.+Mal.+Castelo+Branco,+258+-+Centro,+Teixeira+de+Freitas+-+BA&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <section id="contato" className="py-16 lg:py-24 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          {/* Coluna Esquerda: Informações e Mapa */}
          <RevealOnScroll className="flex flex-col gap-8 h-full justify-between">
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-4xl text-foreground lg:text-5xl mb-4">
                  Entre em Contato
                </h2>
                <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                  Tem alguma dúvida ou prefere fazer o seu pedido diretamente por outro canal? Veja abaixo onde nos encontrar ou envie uma mensagem ao lado.
                </p>
              </div>

              <div className="space-y-4">
                <div className="group flex items-start gap-4 rounded-xl p-3 transition-colors duration-200 hover:bg-accent/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand-dark text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-110">
                    <MapPin size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Endereço</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {SITE_CONTACT.address}
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 rounded-xl p-3 transition-colors duration-200 hover:bg-accent/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand-dark text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-110">
                    <Phone size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {SITE_CONTACT.whatsapp
                        ? formatPhoneNumber(SITE_CONTACT.whatsapp)
                        : "Não configurado"}
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 rounded-xl p-3 transition-colors duration-200 hover:bg-accent/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand-dark text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-110">
                    <Mail size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">E-mail</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {SITE_CONTACT.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa responsivo */}
            <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg border border-border mt-2">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Fase Sport no Google Maps"
              />
            </div>
          </RevealOnScroll>

          {/* Coluna Direita: Formulário de Orçamento */}
          <RevealOnScroll
            className="rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8"
            delay={0.1}
          >
            <div className="mb-6">
              <h3 className="font-heading text-2xl text-foreground">
                Solicite seu Orçamento
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha os passos abaixo para receber sua cotação personalizada.
              </p>
            </div>
            <OrcamentoForm />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
