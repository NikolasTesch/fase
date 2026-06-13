import { prisma } from "@/lib/db";

const STATUS_CONFIG = {
  NEW: { label: "Novo", color: "bg-blue-500" },
  CONTACTED: { label: "Contatado", color: "bg-amber-500" },
  IN_PROGRESS: { label: "Em andamento", color: "bg-orange-500" },
  CLOSED_WON: { label: "Fechado (ganho)", color: "bg-emerald-500" },
  CLOSED_LOST: { label: "Fechado (perdido)", color: "bg-red-500" },
} as const;

function pct(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export async function LeadMetrics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [leadsBySport, leadsByStatus, recentLeads] = await Promise.all([
    prisma.lead.groupBy({
      by: ["sport"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { sport: true },
      orderBy: { _count: { sport: "desc" } },
    }),

    prisma.lead.groupBy({
      by: ["status"],
      _count: { status: true },
    }),

    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS count
      FROM "Lead"
      WHERE "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  ]);

  const totalLeads = leadsByStatus.reduce((s, r) => s + r._count.status, 0);
  const maxSport = leadsBySport[0]?._count.sport ?? 1;

  const dailyCounts = recentLeads.map((r) => ({
    day: new Date(r.day),
    count: Number(r.count),
  }));
  const maxDaily = Math.max(...dailyCounts.map((d) => d.count), 1);

  // Gera os 14 dias do período mesmo que sem leads
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 13 + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  if (totalLeads === 0 && leadsBySport.length === 0 && dailyCounts.length === 0) {
    return (
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Métricas — Últimos 30 dias
        </h2>
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
          Nenhum lead recebido ainda.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Métricas — Últimos 30 dias
      </h2>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Leads por modalidade */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Leads por Modalidade</h3>
          {leadsBySport.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados no período.</p>
          ) : (
            <ul className="space-y-3">
              {leadsBySport.map((row) => (
                <li key={row.sport}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize">{row.sport}</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {row._count.sport}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${pct(row._count.sport, maxSport)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Funil de conversão */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Funil de Conversão</h3>
          {totalLeads === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados.</p>
          ) : (
            <ul className="space-y-3">
              {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(
                (key) => {
                  const row = leadsByStatus.find((r) => r.status === key);
                  const count = row?._count.status ?? 0;
                  return (
                    <li key={key} className="flex items-center gap-3">
                      <span
                        className={`shrink-0 h-2.5 w-2.5 rounded-full ${STATUS_CONFIG[key].color}`}
                      />
                      <span className="flex-1 text-sm">
                        {STATUS_CONFIG[key].label}
                      </span>
                      <span className="text-sm font-semibold tabular-nums w-8 text-right">
                        {count}
                      </span>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {pct(count, totalLeads)}%
                      </span>
                    </li>
                  );
                }
              )}
            </ul>
          )}
        </div>

        {/* Volume diário (14 dias) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Volume Diário (14 dias)</h3>
          <div className="flex items-end gap-1 h-24">
            {days.map((day) => {
              const entry = dailyCounts.find(
                (d) =>
                  d.day.toDateString() === day.toDateString()
              );
              const count = entry?.count ?? 0;
              const heightPct = maxDaily > 0 ? (count / maxDaily) * 100 : 0;
              const label = `${day.getDate()}/${day.getMonth() + 1}`;

              return (
                <div
                  key={day.toISOString()}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={`${label}: ${count} lead${count !== 1 ? "s" : ""}`}
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-primary transition-all"
                      style={{
                        height: heightPct > 0 ? `${heightPct}%` : "2px",
                        opacity: heightPct > 0 ? 1 : 0.2,
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground leading-none">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
