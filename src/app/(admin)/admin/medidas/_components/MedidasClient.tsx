"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface SizeChartRow {
  label: string;
  values: string[];
}

interface ChartItem {
  type: string;
  title: string;
  columns: string[];
  rows: SizeChartRow[];
}

const ALL_TYPES = [
  { type: "camisa", label: "Camisa" },
  { type: "short-masc", label: "Short Masculino" },
  { type: "short-fem", label: "Short Feminino" },
  { type: "short-suplex", label: "Short Suplex" },
  { type: "regata", label: "Regata" },
  { type: "bermuda", label: "Bermuda" },
  { type: "agasalho", label: "Agasalho" },
  { type: "colete", label: "Colete" },
];

function emptyChart(type: string, label: string): ChartItem {
  return {
    type,
    title: label,
    columns: ["Medida 1 (cm)", "Medida 2 (cm)"],
    rows: [
      { label: "P", values: [""] },
      { label: "M", values: [""] },
    ],
  };
}

interface MedidasClientProps {
  initialCharts: ChartItem[];
}

export function MedidasClient({ initialCharts }: MedidasClientProps) {
  const [charts, setCharts] = useState<ChartItem[]>(initialCharts);
  const [editing, setEditing] = useState<ChartItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const existingTypes = new Set(charts.map((c) => c.type));
  const availableTypes = ALL_TYPES.filter((t) => !existingTypes.has(t.type));

  async function handleSave(chart: ChartItem) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/size-charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: chart.type,
          title: chart.title,
          columns: chart.columns,
          rows: chart.rows,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        const newChart: ChartItem = {
          type: saved.type,
          title: saved.title,
          columns: saved.columns as string[],
          rows: saved.rows as SizeChartRow[],
        };
        setCharts((prev) => {
          const idx = prev.findIndex((c) => c.type === newChart.type);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = newChart;
            return next;
          }
          return [...prev, newChart];
        });
        setEditing(null);
        setCreating(false);
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao salvar");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(type: string) {
    if (!confirm(`Tem certeza que deseja excluir a tabela "${type}"?`)) return;

    try {
      const res = await fetch(`/api/admin/size-charts/${type}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCharts((prev) => prev.filter((c) => c.type !== type));
      } else {
        alert("Erro ao excluir");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Existing charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {charts.map((chart) => (
          <div
            key={chart.type}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{chart.title}</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditing({ ...chart, columns: [...chart.columns], rows: chart.rows.map(r => ({ ...r, values: [...r.values] })) });
                    setCreating(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(chart.type)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Grid preview */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted/30 px-2 py-1 text-left font-medium text-muted-foreground">
                      #
                    </th>
                    {chart.columns.map((col) => (
                      <th
                        key={col}
                        className="border border-border bg-muted/30 px-2 py-1 text-left font-medium text-muted-foreground"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row) => (
                    <tr key={row.label} className="even:bg-muted/10">
                      <td className="border border-border px-2 py-1 font-medium">
                        {row.label}
                      </td>
                      {row.values.map((val, i) => (
                        <td key={i} className="border border-border px-2 py-1 text-center">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-muted-foreground mt-2">
              {chart.columns.length} colunas · {chart.rows.length} tamanhos
            </p>
          </div>
        ))}
      </div>

      {/* New chart button */}
      {availableTypes.length > 0 && !creating && (
        <button
          onClick={() => {
            const first = availableTypes[0];
            setEditing(emptyChart(first.type, first.label));
            setCreating(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all duration-200 bg-card"
        >
          <Plus size={16} />
          Adicionar tabela de medidas
        </button>
      )}

      {/* Editor Modal */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setCreating(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>
            {creating ? "Nova tabela" : `Editar: ${editing?.title}`}
          </DialogTitle>

          {editing && (
            <div className="mt-4 flex flex-col gap-4">
              {/* Type selector (only when creating) */}
              {creating && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tipo de peça
                  </label>
                  <select
                    value={editing.type}
                    onChange={(e) => {
                      const t = ALL_TYPES.find((at) => at.type === e.target.value);
                      if (t) setEditing(emptyChart(t.type, t.label));
                    }}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {availableTypes.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Título
                </label>
                <input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Columns */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Colunas (medidas)
                  </label>
                  <button
                    onClick={() =>
                      setEditing({
                        ...editing,
                        columns: [...editing.columns, `Medida ${editing.columns.length + 1} (cm)`],
                        rows: editing.rows.map((r) => ({
                          ...r,
                          values: [...r.values, ""],
                        })),
                      })
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    + Adicionar coluna
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editing.columns.map((col, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <input
                        value={col}
                        onChange={(e) => {
                          const next = [...editing.columns];
                          next[i] = e.target.value;
                          setEditing({ ...editing, columns: next });
                        }}
                        className="w-32 rounded-lg border border-border px-2 py-1 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={() => {
                          if (editing.columns.length <= 1) return;
                          const nextCols = editing.columns.filter((_, j) => j !== i);
                          const nextRows = editing.rows.map((r) => ({
                            ...r,
                            values: r.values.filter((_, j) => j !== i),
                          }));
                          setEditing({
                            ...editing,
                            columns: nextCols,
                            rows: nextRows,
                          });
                        }}
                        className="text-muted-foreground hover:text-destructive text-xs p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Tamanhos
                  </label>
                  <button
                    onClick={() =>
                      setEditing({
                        ...editing,
                        rows: [
                          ...editing.rows,
                          { label: "", values: editing.columns.map(() => "") },
                        ],
                      })
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    + Adicionar tamanho
                  </button>
                </div>
                <div className="space-y-2">
                  {editing.rows.map((row, ri) => (
                    <div key={ri} className="flex items-center gap-2">
                      <input
                        value={row.label}
                        onChange={(e) => {
                          const next = [...editing.rows];
                          next[ri] = { ...next[ri], label: e.target.value };
                          setEditing({ ...editing, rows: next });
                        }}
                        placeholder="Tamanho"
                        className="w-16 rounded-lg border border-border px-2 py-1.5 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {row.values.map((val, vi) => (
                        <input
                          key={vi}
                          value={val}
                          onChange={(e) => {
                            const next = [...editing.rows];
                            next[ri] = {
                              ...next[ri],
                              values: next[ri].values.map((v, j) =>
                                j === vi ? e.target.value : v
                              ),
                            };
                            setEditing({ ...editing, rows: next });
                          }}
                          placeholder="0"
                          className="w-16 rounded-lg border border-border px-2 py-1.5 text-xs text-center bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      ))}
                      <button
                        onClick={() => {
                          const next = editing.rows.filter((_, j) => j !== ri);
                          setEditing({ ...editing, rows: next });
                        }}
                        className="text-muted-foreground hover:text-destructive text-xs p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  disabled={saving}
                  onClick={() => { setEditing(null); setCreating(false); }}
                >
                  Cancelar
                </Button>
                <Button onClick={() => handleSave(editing)} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
