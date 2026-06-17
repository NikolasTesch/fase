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
                className="group relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={post.imageUrl}
                  alt={post.caption ?? "Post Fase Sport"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {post.caption ? (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-sm text-white">{post.caption}</p>
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
