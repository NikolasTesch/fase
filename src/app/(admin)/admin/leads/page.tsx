"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  sport: string;
  quantity: number | null;
  status: string;
  createdAt: string;
  city: string | null;
  details: string | null;
  productSlug: string | null;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  NEW: {
    label: "Novo",
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  CONTACTED: {
    label: "Contactado",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  CLOSED_WON: {
    label: "Ganho",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  CLOSED_LOST: {
    label: "Perdido",
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  ...Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({
    value,
    label,
  })),
];

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

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.bg,
        cfg.text,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copiar"
      className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

function buildLeadWhatsAppUrl(lead: Lead): string {
  const phone = lead.phone.replace(/\D/g, "");
  const sport = SPORT_LABELS[lead.sport] ?? lead.sport;
  const message = encodeURIComponent(
    `Olá ${lead.name}! Recebemos seu pedido de orçamento de uniforme de ${sport} pelo site da Fase Sport. Podemos conversar sobre os detalhes?`,
  );
  return `https://wa.me/${phone}?text=${message}`;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filter ? `/api/admin/leads?status=${filter}` : "/api/admin/leads";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    if (selected?.id === id) setSelected((s) => s && { ...s, status });
    setUpdating(false);
  }

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {leads.length} resultado{leads.length !== 1 ? "s" : ""}{" "}
                {filter ? `com status "${STATUS_CONFIG[filter]?.label}"` : "no total"}
              </p>
            </div>
          </div>

          {/* Pill filters */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all duration-200",
                  filter === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Nome
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Esporte
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Qtd
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {leads.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    onClick={() => setSelected(lead)}
                    className="border-t border-border cursor-pointer hover:bg-muted/40 transition-colors duration-150"
                  >
                    <td className="px-4 py-3.5 font-medium">{lead.name}</td>
                    <td className="px-4 py-3.5 capitalize text-muted-foreground">
                      {SPORT_LABELS[lead.sport] ?? lead.sport}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {lead.quantity ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {!loading && leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Users size={32} className="opacity-30" />
                      <p className="text-sm">Nenhum lead encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Painel lateral */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-72 shrink-0 rounded-2xl border border-border bg-card self-start overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-sm">{selected.name}</h2>
                <div className="mt-1.5">
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Details */}
            <dl className="px-5 py-4 space-y-3 text-sm">
              {/* E-mail */}
              {selected.email && (
                <div>
                  <dt className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                    E-mail
                  </dt>
                  <dd className="flex items-center text-sm text-foreground">
                    <a
                      href={`mailto:${selected.email}`}
                      className="hover:underline truncate"
                    >
                      {selected.email}
                    </a>
                    <CopyButton value={selected.email} />
                  </dd>
                </div>
              )}

              {/* Telefone */}
              <div>
                <dt className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                  Telefone
                </dt>
                <dd className="flex items-center text-sm text-foreground">
                  <a
                    href={`tel:${selected.phone.replace(/\D/g, "")}`}
                    className="hover:underline"
                  >
                    {selected.phone}
                  </a>
                  <CopyButton value={selected.phone} />
                </dd>
              </div>

              {/* Demais campos estáticos */}
              {[
                { label: "Cidade", value: selected.city ?? "—" },
                {
                  label: "Modalidade",
                  value: SPORT_LABELS[selected.sport] ?? selected.sport,
                },
                {
                  label: "Quantidade",
                  value: selected.quantity ? String(selected.quantity) : "—",
                },
                { label: "Produto", value: selected.productSlug ?? "—" },
                {
                  label: "Detalhes",
                  value: selected.details ?? "—",
                  wrap: true,
                },
              ].map(({ label, value, wrap }) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                    {label}
                  </dt>
                  <dd
                    className={cn(
                      "text-sm text-foreground",
                      wrap && "whitespace-pre-wrap",
                    )}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* WhatsApp CTA */}
            <div className="px-5 pb-4">
              <a
                href={buildLeadWhatsAppUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "#25D366" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1ebe59")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#25D366")
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Responder no WhatsApp
              </a>
            </div>

            {/* Status change */}
            <div className="px-5 pb-5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Alterar status
              </label>
              <select
                value={selected.status}
                disabled={updating}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
