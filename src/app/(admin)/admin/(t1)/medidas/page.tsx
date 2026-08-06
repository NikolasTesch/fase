export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { MedidasClient } from "./_components/MedidasClient";

export const metadata: Metadata = { title: "Medidas — Admin" };

export default async function MedidasPage() {
  const charts = await prisma.sizeChart.findMany({
    orderBy: { type: "asc" },
  });

  const chartsData = charts.map((c) => ({
    type: c.type,
    title: c.title,
    columns: c.columns as string[],
    rows: c.rows as { label: string; values: string[] }[],
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Tabelas de Medidas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {chartsData.length} tabela{chartsData.length !== 1 ? "s" : ""} de
          medidas — edite as colunas e valores para cada tipo de peça
        </p>
      </div>

      <MedidasClient initialCharts={chartsData} />
    </div>
  );
}
