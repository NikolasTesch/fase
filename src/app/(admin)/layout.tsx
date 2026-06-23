import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Zap } from "lucide-react";
import { AdminSidebarClient } from "./_components/AdminSidebarClient";
import { LogoutButton } from "./_components/LogoutButton";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

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
      <aside className="w-60 shrink-0 border-r border-border/60 bg-gradient-to-b from-background to-muted/30 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-accent-foreground" />
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
          <AdminSidebarClient />
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-border/60">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
