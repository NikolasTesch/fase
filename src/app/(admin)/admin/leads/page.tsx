"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users } from "lucide-react";
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
                      {lead.sport}
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
            {/* Header colorido por status */}
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
              {[
                { label: "E-mail", value: selected.email },
                { label: "Telefone", value: selected.phone },
                { label: "Cidade", value: selected.city ?? "—" },
                { label: "Modalidade", value: selected.sport, className: "capitalize" },
                { label: "Quantidade", value: selected.quantity ?? "—" },
                { label: "Produto", value: selected.productSlug ?? "—" },
                { label: "Detalhes", value: selected.details ?? "—", wrap: true },
              ].map(({ label, value, className, wrap }) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                    {label}
                  </dt>
                  <dd
                    className={cn(
                      "text-sm text-foreground",
                      className,
                      wrap && "whitespace-pre-wrap",
                    )}
                  >
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>

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
