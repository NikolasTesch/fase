import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  MessageSquare,
  HelpCircle,
  LogOut,
  Zap,
} from "lucide-react";
import { AdminSidebarClient } from "./_components/AdminSidebarClient";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tag },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquare },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) redirect("/admin/login");

  try {
    await jwtVerify(token, secret);
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 shrink-0 border-r border-border bg-card flex flex-col shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap size={16} className="text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none tracking-tight text-foreground">
                Fase Sport
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">
                Admin
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3">
          <AdminSidebarClient nav={NAV} />
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-border">
          <form action="/api/admin/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
            >
              <LogOut
                size={16}
                className="shrink-0 group-hover:text-destructive transition-colors duration-200"
              />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
