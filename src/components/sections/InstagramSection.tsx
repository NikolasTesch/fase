import Image from "next/image";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";

interface InstagramPost {
  id: string;
  imageUrl: string;
  linkUrl: string;
  caption: string | null;
}

interface InstagramSectionProps {
  posts: InstagramPost[];
  videoUrl: string | null;
}

export function InstagramSection({ posts, videoUrl }: InstagramSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-muted py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Grid Instagram */}
        <div>
          <RevealOnScroll className="mb-8 text-center">
            <h2 className="font-heading text-3xl text-foreground lg:text-4xl">
              Faça como esses campeões
            </h2>
            <p className="mt-3 text-muted-foreground">
              Uniformes reais entregues pela Fase Sport.
            </p>
          </RevealOnScroll>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/[0.03] transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <svg viewBox="0 0 24 24" className="size-4 fill-current text-foreground" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <Image
                  src={post.imageUrl}
                  alt={post.caption ?? "Post Fase Sport"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {post.caption ? (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <p className="text-sm text-white drop-shadow-sm">{post.caption}</p>
                  </div>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
