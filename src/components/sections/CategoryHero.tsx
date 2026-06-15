import Image from "next/image";

interface CategoryHeroProps {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export function CategoryHero({ name, description, imageUrl }: CategoryHeroProps) {
  return (
    <section className="relative isolate min-h-[380px] lg:min-h-[450px] flex items-center overflow-hidden rounded-3xl bg-red-950 text-white shadow-xl">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
      ) : null}

      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-red-950 via-red-950/80 to-red-900/20 lg:from-red-950 lg:via-red-950/85 lg:to-transparent"
        aria-hidden="true"
      />

      <div className="w-full max-w-3xl px-6 py-16 lg:px-12 lg:py-24">
        <h1 className="font-heading text-5xl leading-none text-white font-extrabold uppercase tracking-tight md:text-6xl lg:text-7xl">
          {name}
        </h1>
        {description ? (
          <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-zinc-100/90 md:text-xl">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
