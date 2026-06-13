import Image from "next/image";

interface CategoryHeroProps {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export function CategoryHero({ name, description, imageUrl }: CategoryHeroProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-primary text-primary-foreground">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={name}
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/90 to-primary/40"
            aria-hidden="true"
          />
        </>
      ) : (
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-primary to-brand-dark"
          aria-hidden="true"
        />
      )}
      <div className="flex flex-col gap-3 px-6 py-12 lg:px-10 lg:py-16">
        <h1 className="font-heading text-5xl leading-none lg:text-6xl">{name}</h1>
        {description ? (
          <p className="max-w-2xl text-base text-primary-foreground/90 lg:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
