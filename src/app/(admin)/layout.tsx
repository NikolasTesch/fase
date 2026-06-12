import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/faqs", label: "FAQs" },
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
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="px-4 py-5 border-b border-border font-semibold text-sm">
          Fase Sport — Admin
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form action="/api/admin/auth/logout" method="POST" className="p-4">
          <button
            type="submit"
            className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sair
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
