"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Shirt } from "lucide-react";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";

interface ModalityLineItem {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

interface ModalitySection {
  title: string;
  subtitle?: string;
  lines: ModalityLineItem[];
  catalogLinks?: { label: string; href: string }[];
}

const MODALITY_SECTIONS: ModalitySection[] = [
  {
    title: "Esportes",
    subtitle: "Futebol, Vôlei, Handebol e Escolinha",
    lines: [
      { id: "prata", name: "Linha Prata", imageUrl: "/images/modalities/esportes-prata.jpg", description: "Excelente custo-benefício para times amadores com tecido dry-fit de qualidade." },
      { id: "ouro", name: "Linha Ouro", imageUrl: "/images/modalities/esportes-ouro.jpg", description: "Sublimação total em alta definição e modelagem atlética." },
      { id: "profissional", name: "Profissional", imageUrl: "/images/modalities/esportes-profissional.jpg", description: "Tecidos tecnológicos combinados, gola personalizada e recortes dry." },
      { id: "escolinha", name: "Escolinha", imageUrl: "/images/modalities/esportes-escolinha.jpg", description: "Kits duráveis com foco em mobilidade e conforto para jovens atletas." },
    ],
    catalogLinks: [
      { label: "Ver Futebol", href: "/futebol" },
      { label: "Ver Vôlei", href: "/volei" },
      { label: "Ver Handebol", href: "/handebol" },
      { label: "Ver Escolinha", href: "/futebol?sub=infantil" },
    ],
  },
  {
    title: "Basquete",
    lines: [
      { id: "basquete-prata", name: "Linha Prata", imageUrl: "/images/modalities/basquete-prata.jpg", description: "Modelagem tradicional americana com tecido respirável." },
      { id: "basquete-ouro", name: "Linha Ouro", imageUrl: "/images/modalities/basquete-ouro.jpg", description: "Design moderno com sublimação completa, gola diferenciada." },
      { id: "basquete-profissional", name: "Profissional", imageUrl: "/images/modalities/basquete-profissional.jpg", description: "Linha profissional com recortes dry, bordas elásticas e alta ventilação." },
    ],
  },
  {
    title: "Coletes",
    lines: [
      { id: "colete-aberto", name: "Colete Aberto", imageUrl: "/images/modalities/colete-aberto.jpg", description: "Ajuste por fitas elásticas nas laterais, alta praticidade." },
      { id: "colete-fechado", name: "Fechado Simples", imageUrl: "/images/modalities/colete-fechado.jpg", description: "Fechamento clássico lateral, caimento leve para treinos." },
      { id: "colete-dupla", name: "Dupla Face", imageUrl: "/images/modalities/colete-dupla.jpg", description: "Um colete com duas cores totalmente usáveis, agilidade na divisão de equipes." },
    ],
  },
  {
    title: "Passeio",
    lines: [
      { id: "passeio-comissao", name: "Passeio Comissão", imageUrl: "/images/modalities/passeio-comissao.jpg", description: "Polos e camisas de botão para staff e equipe técnica." },
      { id: "passeio-torcida", name: "Torcida", imageUrl: "/images/modalities/passeio-torcida.jpg", description: "Camisetas casuais sublimadas e personalizadas para apoiadores e famílias." },
    ],
  },
  {
    title: "Agasalhos, Calças e Acessórios",
    lines: [
      { id: "agasalhos", name: "Agasalhos", imageUrl: "/images/modalities/agasalho.jpg", description: "Jaquetas corta-vento ou de helanca com zíper e bolsos." },
      { id: "calcas", name: "Calças", imageUrl: "/images/modalities/calca.jpg", description: "Calças de treino flexíveis com ajuste elástico." },
      { id: "acessorios", name: "Acessórios", imageUrl: "/images/modalities/acessorio.jpg", description: "Meiões, tornozeleiras e headbands para fechar o uniforme do time." },
    ],
  },
];

interface ModalitySectionBlockProps {
  section: ModalitySection;
}

function ModalitySectionBlock({ section }: ModalitySectionBlockProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => setActiveIdx((i) => (i - 1 + section.lines.length) % section.lines.length);
  const next = () => setActiveIdx((i) => (i + 1) % section.lines.length);

  const active = section.lines[activeIdx];

  return (
    <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 lg:grid-cols-2 lg:items-center">
      <div className="flex flex-col gap-4 lg:order-1">
        <div>
          <h3 className="font-heading text-3xl text-foreground">{section.title}</h3>
          {section.subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">{active.name}</p>
          <p className="mt-1 text-muted-foreground">{active.description}</p>
        </div>
        <div className="flex gap-2">
          {section.lines.map((line, i) => (
            <button key={line.id} type="button" onClick={() => setActiveIdx(i)} aria-label={`Ver ${line.name}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === activeIdx ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
            />
          ))}
        </div>
        {section.catalogLinks ? (
          <div className="flex flex-wrap gap-2">
            {section.catalogLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground"
              >{link.label}</Link>
            ))}
          </div>
        ) : null}
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted lg:order-2">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
            <Shirt className="size-16 text-primary/30" aria-hidden="true" />
          </div>
          <Image key={active.id} src={active.imageUrl} alt={active.name} fill
            sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-opacity duration-300"
          />
        </div>
        {section.lines.length > 1 ? (
          <>
            <button type="button" onClick={prev} aria-label="Linha anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background"
            ><ChevronLeft className="size-4" /></button>
            <button type="button" onClick={next} aria-label="Próxima linha"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background"
            ><ChevronRight className="size-4" /></button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function CategoriesSection() {
  return (
    <section id="categorias" className="bg-background py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        <RevealOnScroll className="mb-10 max-w-2xl">
          <h2 className="font-heading text-4xl text-foreground lg:text-5xl">Modalidades</h2>
          <p className="mt-3 text-muted-foreground">Explore as linhas de cada categoria e encontre o uniforme ideal para o seu time.</p>
        </RevealOnScroll>
        <div className="flex flex-col gap-6">
          {MODALITY_SECTIONS.map((section) => (
            <ModalitySectionBlock key={section.title} section={section} />
          ))}
        </div>
      </div>
    </section>
  );
}
