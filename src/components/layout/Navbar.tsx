import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CATEGORY_NAV } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Fase Sport — início" className="shrink-0">
          <Image
            src="/logo.svg"
            alt="Fase Sport"
            width={116}
            height={60}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {CATEGORY_NAV.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="lg"
            className="hidden md:inline-flex"
            render={<Link href="/orcamento" />}
          >
            Orçamento
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
