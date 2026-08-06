import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";

export default async function T1AreaLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "T1_GERENCIA") redirect("/admin/conteudo");
  return <>{children}</>;
}
