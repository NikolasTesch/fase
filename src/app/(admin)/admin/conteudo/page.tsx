export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ConteudoClient } from "./_components/ConteudoClient";

export const metadata: Metadata = { title: "Conteúdo — Admin Fase Sport" };

export default async function ConteudoPage() {
  const user = await requireAdmin();

  const [tags, arts] = await Promise.all([
    prisma.artTag.findMany({ orderBy: { name: "asc" } }),
    prisma.artFile.findMany({
      include: {
        tags: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <ConteudoClient tags={tags} arts={arts} role={user.role} userId={user.id} />;
}
