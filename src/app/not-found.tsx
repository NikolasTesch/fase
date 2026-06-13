import { NotFoundContent } from "@/components/layout/NotFoundContent";

export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body className="min-h-full flex flex-col">
        <main className="flex-1">
          <NotFoundContent />
        </main>
      </body>
    </html>
  );
}
