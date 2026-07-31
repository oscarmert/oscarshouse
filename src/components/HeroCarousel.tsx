"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type CarouselSlide = {
  imageUrl: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

// Full-bleed, auto-rotating promo carousel — the "campaign banner" look big
// fashion/sportswear sites (Nike, Adidas, Calvin Klein, Balenciaga...) use on
// their homepages: large bold type over a lifestyle photo, a dark gradient
// for legibility, dot + arrow navigation, and a slow autoplay that pauses on
// hover so it doesn't fight the visitor. Pure CSS crossfade, no JS animation
// library, no external dependency.
export function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full h-[62vh] min-h-[420px] max-h-[640px] overflow-hidden bg-neutral-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-end sm:justify-center pb-16 sm:pb-0">
            <p
              className={`text-white/80 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-3 ${
                i === index ? "animate-[fadeInUp_0.6s_ease-out_0.05s_both]" : ""
              }`}
            >
              {slide.eyebrow}
            </p>
            <h1
              className={`text-white text-4xl sm:text-6xl font-bold max-w-xl leading-[1.05] ${
                i === index ? "animate-[fadeInUp_0.6s_ease-out_0.12s_both]" : ""
              }`}
            >
              {slide.title}
            </h1>
            <p
              className={`text-white/90 mt-4 max-w-md text-sm sm:text-base ${
                i === index ? "animate-[fadeInUp_0.6s_ease-out_0.2s_both]" : ""
              }`}
            >
              {slide.subtitle}
            </p>
            <Link
              href={slide.ctaHref}
              className={`inline-block mt-7 w-fit bg-white text-neutral-900 px-7 py-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-200 hover:bg-neutral-200 hover:scale-105 active:scale-95 ${
                i === index ? "animate-[fadeInUp_0.6s_ease-out_0.28s_both]" : ""
              }`}
            >
              {slide.ctaLabel}
            </Link>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Önceki"
            onClick={() => goTo(index - 1)}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Sonraki"
            onClick={() => goTo(index + 1)}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            →
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}. slayta git`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
