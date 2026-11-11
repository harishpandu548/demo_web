import Image from "next/image";

// Temporary hero photography pulled from the preloader footage until final
// campaign photography is supplied — swap the file at this path to replace it.
const HERO_IMAGE_SRC = "/images/hero/hero-image.jpg";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden sm:items-center">
      <Image
        src={HERO_IMAGE_SRC}
        alt="OSSAGI boutique interior featuring the modest fashion collection"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-charcoal/30" />

      <div className="relative z-10 w-full px-6 pb-16 sm:px-10 sm:pb-0">
        <div className="max-w-xl">
          <p className="mb-4 text-xs tracking-[0.3em] text-champagne uppercase">
            Modest Luxury, Redefined
          </p>
          <h1 className="font-serif text-4xl leading-[1.1] text-ivory sm:text-6xl">
            Where Grace Meets Craftsmanship
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/80 sm:text-base">
            Discover a curated collection of timeless silhouettes, woven from
            the finest fabrics for the modern, modest woman.
          </p>
          <button
            type="button"
            className="mt-10 border border-gold/70 px-8 py-3 text-xs tracking-[0.25em] text-ivory uppercase transition-colors hover:bg-gold/10"
          >
            Explore Collection
          </button>
        </div>
      </div>
    </section>
  );
}
