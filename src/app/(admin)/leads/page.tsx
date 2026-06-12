"use client";

import { useEffect, useState } from "react";

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

const STATUS_LABELS: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  IN_PROGRESS: "Em andamento",
  CLOSED_WON: "Ganho",
  CLOSED_LOST: "Perdido",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS);

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const url = filter ? `/api/admin/leads?status=${filter}` : "/api/admin/leads";
    fetch(url)
      .then((r) => r.json())
      .then(setLeads)
      .catch(console.error);
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    if (selected?.id === id) setSelected((s) => s && { ...s, status });
    setUpdating(false);
  }

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Leads</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nome</th>
                <th className="text-left px-4 py-3 font-medium">Esporte</th>
                <th className="text-left px-4 py-3 font-medium">Qtd</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className="border-t border-border cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">{lead.name}</td>
                  <td className="px-4 py-3 capitalize">{lead.sport}</td>
                  <td className="px-4 py-3">{lead.quantity ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2 py-0.5 text-xs bg-muted">
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Painel lateral */}
      {selected && (
        <aside className="w-72 shrink-0 rounded-xl border border-border bg-card p-5 self-start">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Detalhes</h2>
            <button
              onClick={() => setSelected(null)}
              className="text-muted-foreground text-lg leading-none"
            >
              ×
            </button>
          </div>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-muted-foreground">Nome</dt><dd>{selected.name}</dd></div>
            <div><dt className="text-muted-foreground">E-mail</dt><dd>{selected.email}</dd></div>
            <div><dt className="text-muted-foreground">Telefone</dt><dd>{selected.phone}</dd></div>
            <div><dt className="text-muted-foreground">Cidade</dt><dd>{selected.city ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Modalidade</dt><dd className="capitalize">{selected.sport}</dd></div>
            <div><dt className="text-muted-foreground">Quantidade</dt><dd>{selected.quantity ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Produto</dt><dd>{selected.productSlug ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Detalhes</dt><dd className="whitespace-pre-wrap">{selected.details ?? "—"}</dd></div>
          </dl>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={selected.status}
              disabled={updating}
              onChange={(e) => updateStatus(selected.id, e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </aside>
      )}
    </div>
  );
}
