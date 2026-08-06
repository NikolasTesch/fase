export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";
import { UsuariosClient } from "./_components/UsuariosClient";

export default async function UsuariosPage() {
  const [users, currentUser] = await Promise.all([
    prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getAdminUser(),
  ]);

  return (
    <UsuariosClient
      users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      currentUserId={currentUser?.id}
    />
  );
}
