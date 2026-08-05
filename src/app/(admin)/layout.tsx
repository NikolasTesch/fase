import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { Zap, ExternalLink, ShieldCheck } from "lucide-react";
import { AdminSidebarClient } from "./_components/AdminSidebarClient";
import { LogoutButton } from "./_components/LogoutButton";
import { ThemeToggle } from "./_components/ThemeToggle";

import { getJwtSecret } from "@/lib/auth-jwt";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) redirect("/admin/login");

  try {
    await jwtVerify(token, getJwtSecret());
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border/60 bg-card/50 backdrop-blur-md flex flex-col shadow-sm z-20">
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-border/60">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-sm group-hover:bg-primary/40 transition-colors duration-300" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-primary-foreground shrink-0 shadow-md shadow-primary/10">
                <Zap size={18} className="fill-current text-white" />
              </div>
            </div>
            <div>
              <p className="font-extrabold text-base leading-none tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                Fase Sport
              </p>
              <p className="text-[10px] font-semibold text-muted-foreground mt-1 uppercase tracking-widest">
                Painel Gestão
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <AdminSidebarClient />
        </nav>

        {/* Footer / Controls */}
        <div className="p-3.5 border-t border-border/60 space-y-1 bg-muted/20">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content & Topbar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Header */}
        <header className="h-16 border-b border-border/60 bg-card/40 backdrop-blur-md px-8 flex items-center justify-between gap-4 sticky top-0 z-10">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sistema Operacional
            </span>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background/80 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-primary/40 transition-all duration-200"
            >
              <span>Ver Loja</span>
              <ExternalLink size={13} />
            </Link>

            <div className="h-4 w-px bg-border/60" />

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <ShieldCheck size={14} />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-none text-foreground">Admin Fase</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Gestor Geral</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
