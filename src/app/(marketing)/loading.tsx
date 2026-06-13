export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12">
      <div className="animate-pulse space-y-8">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="h-64 w-full rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
