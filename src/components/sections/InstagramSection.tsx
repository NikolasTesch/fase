import Image from "next/image";
import Link from "next/link";

import { RevealOnScroll } from "@/components/sections/RevealOnScroll";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { buildWhatsAppUrl } from "@/lib/site";
import { Button } from "@/components/ui/button";

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
  const whatsappUrl = buildWhatsAppUrl("Olá Fase Sport! Vi o trabalho de vocês e quero fazer meu uniforme também!");

  return (
    <section className="bg-muted py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Hero lateral */}
        <div className="mb-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <RevealOnScroll>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Sua nova fase começa aqui
            </p>
            <h2 className="mt-2 font-heading text-5xl text-foreground lg:text-6xl">
              Viva sua nova fase
            </h2>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Uniformes que identificam, motivam e fazem a diferença dentro e
              fora de campo. Faça parte da família Fase Sport.
            </p>
            <div className="mt-8">
              <Button size="lg" render={<Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}>
                Falar no WhatsApp
              </Button>
            </div>
          </RevealOnScroll>

          {videoUrl ? (
            <HeroVideo src={videoUrl} />
          ) : null}
        </div>

        {/* Grid Instagram */}
        {posts.length > 0 ? (
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
        ) : null}
      </div>
    </section>
  );
}
