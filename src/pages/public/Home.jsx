import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { useStore } from "../../contexts/StoreContext";

const DEFAULT_PRIMARY_COLOR = "#0f172a";
const DEFAULT_SECONDARY_COLOR = "#d97706";

export default function Home() {
  const {
    settings,
    categories = [],
    publicProducts = [],
    loading,
  } = useStore();

  const primaryColor = getSafeColor(
    settings?.primaryColor,
    DEFAULT_PRIMARY_COLOR,
  );

  const secondaryColor = getSafeColor(
    settings?.secondaryColor,
    DEFAULT_SECONDARY_COLOR,
  );

  const themeStyle = {
    "--store-primary": primaryColor,
    "--store-secondary": secondaryColor,
    "--store-secondary-shadow": hexToRgba(secondaryColor, 0.3),
  };

  const roots = categories
    .filter((item) => !item.parentId && item.active)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const featured = publicProducts.filter((item) => item.featured).slice(0, 8);

  const modelImages = (settings?.newArrivalModels || []).filter(
    (item) => item.active !== false,
  );

  const brandingBanners = (settings?.brandingBanners || []).filter(
    (item) => item.active !== false,
  );

  if (loading && !settings) {
    return (
      <div
        style={themeStyle}
        className="grid min-h-[60vh] place-items-center bg-white"
      >
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <span
            className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200"
            style={{
              borderTopColor: secondaryColor,
            }}
          />
          Loading store...
        </div>
      </div>
    );
  }

  return (
    <main
      style={themeStyle}
      className="home-page-enter overflow-hidden bg-[#faf9f6] text-[var(--store-primary)]"
    >
      <style>{`
        @keyframes homePageEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes homeHeroImageEnter {
          from {
            opacity: 0;
            transform: scale(1.07);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes homeHeroContentEnter {
          from {
            opacity: 0;
            transform: translateY(36px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .home-page-enter {
          animation: homePageEnter 800ms cubic-bezier(.16, 1, .3, 1) both;
        }

        /* Hero image আগে আসবে */
        .home-hero-image {
          opacity: 0;
          transform: scale(1.07);
          animation: homeHeroImageEnter 1800ms cubic-bezier(.16, 1, .3, 1)
            80ms forwards;
          will-change: opacity, transform;
        }

        /* Hero text একটার পর একটা আসবে */
        .home-hero-item {
          opacity: 0;
          transform: translateY(36px) scale(0.985);
          animation: homeHeroContentEnter 1150ms cubic-bezier(.16, 1, .3, 1)
            forwards;
          will-change: opacity, transform;
        }

        .home-hero-eyebrow {
          animation-delay: 360ms;
        }

        .home-hero-title {
          animation-delay: 620ms;
        }

        .home-hero-subtitle {
          animation-delay: 880ms;
        }

        .home-hero-button {
          animation-delay: 1120ms;
        }

        /* সম্পূর্ণ section ধীরে উঠবে */
        .home-reveal {
          opacity: 0;
          transform: translateY(50px) scale(0.985);
          transition:
            opacity 1100ms cubic-bezier(.16, 1, .3, 1),
            transform 1250ms cubic-bezier(.16, 1, .3, 1);
          will-change: opacity, transform;
        }

        .home-reveal.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Section heading stagger */
        .home-reveal .home-heading-eyebrow,
        .home-reveal .home-heading-title,
        .home-reveal .home-heading-link,
        .home-reveal .home-arrival-description {
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity 900ms cubic-bezier(.16, 1, .3, 1),
            transform 1050ms cubic-bezier(.16, 1, .3, 1);
        }

        .home-reveal .home-heading-eyebrow {
          transition-delay: 160ms;
        }

        .home-reveal .home-heading-title {
          transition-delay: 320ms;
        }

        .home-reveal .home-heading-link,
        .home-reveal .home-arrival-description {
          transition-delay: 500ms;
        }

        .home-reveal.is-visible .home-heading-eyebrow,
        .home-reveal.is-visible .home-heading-title,
        .home-reveal.is-visible .home-heading-link,
        .home-reveal.is-visible .home-arrival-description {
          opacity: 1;
          transform: translateY(0);
        }

        /* Category card আগে, image তারপর text */
        .home-category-card {
          opacity: 0;
          transform: translateY(42px) scale(0.97);
          transition:
            opacity 1000ms cubic-bezier(.16, 1, .3, 1),
            transform 1150ms cubic-bezier(.16, 1, .3, 1),
            box-shadow 500ms ease;
          transition-delay: var(--item-delay, 0ms);
          will-change: opacity, transform;
        }

        .home-reveal.is-visible .home-category-card {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .home-category-image {
          opacity: 0;
          transform: translateY(16px) scale(1.075);
          transition:
            opacity 1200ms cubic-bezier(.16, 1, .3, 1),
            transform 1450ms cubic-bezier(.16, 1, .3, 1);
          transition-delay: calc(var(--item-delay, 0ms) + 180ms);
          will-change: opacity, transform;
        }

        .home-reveal.is-visible .home-category-image {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .home-category-title,
        .home-category-description {
          opacity: 0;
          transform: translateY(22px);
          transition:
            opacity 850ms cubic-bezier(.16, 1, .3, 1),
            transform 1000ms cubic-bezier(.16, 1, .3, 1);
        }

        .home-category-title {
          transition-delay: calc(var(--item-delay, 0ms) + 620ms);
        }

        .home-category-description {
          transition-delay: calc(var(--item-delay, 0ms) + 800ms);
        }

        .home-reveal.is-visible .home-category-title,
        .home-reveal.is-visible .home-category-description {
          opacity: 1;
          transform: translateY(0);
        }

        /* Featured ProductCard animation */
        .home-product-sequence {
          opacity: 0;
          transform: translateY(46px) scale(0.97);
          transition:
            opacity 1000ms cubic-bezier(.16, 1, .3, 1),
            transform 1200ms cubic-bezier(.16, 1, .3, 1);
          transition-delay: var(--item-delay, 0ms);
          will-change: opacity, transform;
        }

        .home-reveal.is-visible .home-product-sequence {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .home-product-sequence img {
          opacity: 0;
          transform: translateY(18px) scale(1.065);
          transition:
            opacity 1200ms cubic-bezier(.16, 1, .3, 1),
            transform 1450ms cubic-bezier(.16, 1, .3, 1);
          transition-delay: calc(var(--item-delay, 0ms) + 180ms);
          will-change: opacity, transform;
        }

        .home-reveal.is-visible .home-product-sequence img {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .home-product-sequence :is(h1, h2, h3, h4) {
          opacity: 0;
          transform: translateY(22px);
          transition:
            opacity 850ms cubic-bezier(.16, 1, .3, 1),
            transform 1000ms cubic-bezier(.16, 1, .3, 1);
          transition-delay: calc(var(--item-delay, 0ms) + 650ms);
        }

        .home-product-sequence p {
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 800ms cubic-bezier(.16, 1, .3, 1),
            transform 950ms cubic-bezier(.16, 1, .3, 1);
          transition-delay: calc(var(--item-delay, 0ms) + 790ms);
        }

        .home-product-sequence span {
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity 800ms cubic-bezier(.16, 1, .3, 1),
            transform 950ms cubic-bezier(.16, 1, .3, 1),
            background-color 350ms ease,
            color 350ms ease;
          transition-delay: calc(var(--item-delay, 0ms) + 900ms);
        }

        .home-product-sequence button {
          opacity: 0;
          transform: translateY(18px) scale(0.98);
          transition:
            opacity 800ms cubic-bezier(.16, 1, .3, 1),
            transform 950ms cubic-bezier(.16, 1, .3, 1),
            background-color 350ms ease,
            color 350ms ease,
            box-shadow 350ms ease;
          transition-delay: calc(var(--item-delay, 0ms) + 1020ms);
        }

        .home-reveal.is-visible .home-product-sequence :is(h1, h2, h3, h4),
        .home-reveal.is-visible .home-product-sequence p,
        .home-reveal.is-visible .home-product-sequence span,
        .home-reveal.is-visible .home-product-sequence button {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Branding banner image আগে আসবে */
        .home-banner-card {
          opacity: 0;
          transform: translateY(46px) scale(0.975);
          transition:
            opacity 1050ms cubic-bezier(.16, 1, .3, 1),
            transform 1200ms cubic-bezier(.16, 1, .3, 1),
            box-shadow 500ms ease;
          transition-delay: var(--item-delay, 0ms);
          will-change: opacity, transform;
        }

        .home-reveal.is-visible .home-banner-card {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .home-banner-image {
          opacity: 0;
          transform: scale(1.075);
          transition:
            opacity 1250ms cubic-bezier(.16, 1, .3, 1),
            transform 1500ms cubic-bezier(.16, 1, .3, 1);
          transition-delay: calc(var(--item-delay, 0ms) + 180ms);
          will-change: opacity, transform;
        }

        .home-reveal.is-visible .home-banner-image {
          opacity: 1;
          transform: scale(1);
        }

        .home-banner-kicker,
        .home-banner-title,
        .home-banner-subtitle,
        .home-banner-button {
          opacity: 0;
          transform: translateY(22px);
          transition:
            opacity 850ms cubic-bezier(.16, 1, .3, 1),
            transform 1000ms cubic-bezier(.16, 1, .3, 1),
            background-color 350ms ease,
            color 350ms ease;
        }

        .home-banner-kicker {
          transition-delay: calc(var(--item-delay, 0ms) + 580ms);
        }

        .home-banner-title {
          transition-delay: calc(var(--item-delay, 0ms) + 720ms);
        }

        .home-banner-subtitle {
          transition-delay: calc(var(--item-delay, 0ms) + 860ms);
        }

        .home-banner-button {
          transition-delay: calc(var(--item-delay, 0ms) + 1000ms);
        }

        .home-reveal.is-visible .home-banner-kicker,
        .home-reveal.is-visible .home-banner-title,
        .home-reveal.is-visible .home-banner-subtitle,
        .home-reveal.is-visible .home-banner-button {
          opacity: 1;
          transform: translateY(0);
        }

        /* New arrival image তারপর লেখা */
        .home-arrival-card {
          opacity: 0;
          transform: translateY(46px) scale(0.975);
          transition:
            opacity 1050ms cubic-bezier(.16, 1, .3, 1),
            transform 1200ms cubic-bezier(.16, 1, .3, 1),
            box-shadow 500ms ease;
          transition-delay: var(--item-delay, 0ms);
          will-change: opacity, transform;
        }

        .home-reveal.is-visible .home-arrival-card {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .home-arrival-image {
          opacity: 0;
          transform: translateY(16px) scale(1.075);
          transition:
            opacity 1250ms cubic-bezier(.16, 1, .3, 1),
            transform 1500ms cubic-bezier(.16, 1, .3, 1);
          transition-delay: calc(var(--item-delay, 0ms) + 180ms);
          will-change: opacity, transform;
        }

        .home-reveal.is-visible .home-arrival-image {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .home-arrival-kicker,
        .home-arrival-title,
        .home-arrival-subtitle {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 850ms cubic-bezier(.16, 1, .3, 1),
            transform 1000ms cubic-bezier(.16, 1, .3, 1);
        }

        .home-arrival-kicker {
          transition-delay: calc(var(--item-delay, 0ms) + 600ms);
        }

        .home-arrival-title {
          transition-delay: calc(var(--item-delay, 0ms) + 760ms);
        }

        .home-arrival-subtitle {
          transition-delay: calc(var(--item-delay, 0ms) + 920ms);
        }

        .home-reveal.is-visible .home-arrival-kicker,
        .home-reveal.is-visible .home-arrival-title,
        .home-reveal.is-visible .home-arrival-subtitle {
          opacity: 1;
          transform: translateY(0);
        }

        .home-theme-link {
          color: #1e293b;
          border-color: #cbd5e1;
        }

        .home-theme-link:hover {
          color: var(--store-secondary);
          border-color: var(--store-secondary);
        }

        .home-secondary-button {
          background: var(--store-secondary);
          box-shadow: 0 20px 45px var(--store-secondary-shadow);
        }

        .home-secondary-button:hover {
          opacity: 0.92;
        }

        .home-banner-button {
          color: #0f172a;
        }

        .home-banner-card:hover .home-banner-button {
          background: #0f172a;
          color: #ffffff;
        }

        @media (hover: hover) {
          .home-category-card:hover,
          .home-product-sequence:hover,
          .home-arrival-card:hover {
            transform: translateY(-7px) scale(1.008);
          }

          .home-banner-card:hover {
            transform: translateY(-9px) scale(1.006);
          }

          .home-category-card:hover .home-category-image,
          .home-arrival-card:hover .home-arrival-image {
            transform: translateY(0) scale(1.055);
          }

          .home-banner-card:hover .home-banner-image {
            transform: scale(1.045);
          }

          .home-product-sequence:hover img {
            transform: translateY(0) scale(1.035);
          }
        }

        @media (max-width: 640px) {
          .home-hero-image {
            animation-duration: 1450ms;
          }

          .home-hero-item {
            animation-duration: 950ms;
          }

          .home-hero-eyebrow {
            animation-delay: 260ms;
          }

          .home-hero-title {
            animation-delay: 460ms;
          }

          .home-hero-subtitle {
            animation-delay: 660ms;
          }

          .home-hero-button {
            animation-delay: 840ms;
          }

          .home-reveal {
            transition-duration: 950ms, 1050ms;
          }

          .home-product-sequence :is(h1, h2, h3, h4) {
            transition-delay: calc(var(--item-delay, 0ms) + 520ms);
          }

          .home-product-sequence p {
            transition-delay: calc(var(--item-delay, 0ms) + 640ms);
          }

          .home-product-sequence span {
            transition-delay: calc(var(--item-delay, 0ms) + 750ms);
          }

          .home-product-sequence button {
            transition-delay: calc(var(--item-delay, 0ms) + 860ms);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-page-enter,
          .home-hero-image,
          .home-hero-item,
          .home-reveal,
          .home-reveal.is-visible,
          .home-heading-eyebrow,
          .home-heading-title,
          .home-heading-link,
          .home-arrival-description,
          .home-category-card,
          .home-category-image,
          .home-category-title,
          .home-category-description,
          .home-product-sequence,
          .home-product-sequence img,
          .home-product-sequence :is(h1, h2, h3, h4, p, span, button),
          .home-banner-card,
          .home-banner-image,
          .home-banner-kicker,
          .home-banner-title,
          .home-banner-subtitle,
          .home-banner-button,
          .home-arrival-card,
          .home-arrival-image,
          .home-arrival-kicker,
          .home-arrival-title,
          .home-arrival-subtitle {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Hero */}
      <section className="relative isolate flex min-h-[580px] items-center overflow-hidden bg-slate-950 text-white sm:min-h-[620px] lg:min-h-[680px]">
        <div
          className="home-hero-image absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `
              linear-gradient(
                90deg,
                rgba(2, 6, 23, 0.92) 0%,
                rgba(2, 6, 23, 0.74) 45%,
                rgba(2, 6, 23, 0.12) 100%
              ),
              url("${settings?.heroImage || ""}")
            `,
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-tl-[160px] border-l border-t border-white/10 bg-white/[0.03]" />

        <div className="relative z-10 mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-20 lg:px-6 lg:py-24">
          <div className="max-w-[760px]">
            <span className="home-hero-item home-hero-eyebrow inline-block border-l-2 border-[var(--store-secondary)] pl-4 text-[11px] font-black uppercase tracking-[0.28em] text-[var(--store-secondary)]">
              Universal Commerce
            </span>

            <h1 className="home-hero-item home-hero-title mt-6 max-w-[800px] font-serif text-5xl font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:text-6xl lg:text-[78px]">
              {settings?.heroTitle || "Discover your next favorite"}
            </h1>

            <p className="home-hero-item home-hero-subtitle mt-6 max-w-[620px] text-base leading-8 text-slate-200 sm:text-lg">
              {settings?.heroSubtitle}
            </p>

            <Link
              to="/shop"
              className="home-hero-item home-hero-button home-secondary-button group mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-7 text-sm font-black text-white transition duration-500 hover:-translate-y-1"
            >
              {settings?.heroButtonText || "Shop Now"}

              <ArrowRight
                size={18}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {roots.length > 0 && (
        <RevealSection className="mx-auto w-full max-w-[1180px] px-3 py-10 sm:px-6 sm:py-12 lg:px-6 lg:py-14">
          <SectionHeading
            eyebrow="Explore departments"
            title="Shop by Category"
            linkText="View all"
          />

          <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4 lg:gap-5">
            {roots.map((category, index) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                style={{
                  "--item-delay": `${(index % 4) * 150}ms`,
                }}
                className={[
                  "home-category-card group relative isolate overflow-hidden",
                  "min-h-[155px] rounded-[16px] bg-slate-900",
                  "shadow-[0_12px_35px_rgba(15,23,42,0.12)]",
                  "sm:min-h-[240px] sm:rounded-[24px]",
                  "lg:min-h-[320px] lg:rounded-[30px]",
                ].join(" ")}
              >
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="home-category-image absolute inset-0 h-full w-full object-cover"
                  />
                )}

                <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <span
                  className={[
                    "pointer-events-none absolute inset-2",
                    "rounded-[12px] border border-white/20",
                    "opacity-0 transition duration-500",
                    "group-hover:opacity-100",
                    "sm:inset-3 sm:rounded-[18px]",
                    "lg:rounded-[22px]",
                  ].join(" ")}
                />

                <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-5 lg:p-7">
                  <h3
                    className={[
                      "home-category-title line-clamp-2 font-serif font-semibold",
                      "text-sm leading-tight text-white",
                      "sm:text-xl",
                      "lg:text-3xl",
                    ].join(" ")}
                  >
                    {category.name}
                  </h3>

                  {category.description && (
                    <p
                      className={[
                        "home-category-description mt-1 hidden text-xs leading-5 text-slate-200",
                        "sm:line-clamp-2 sm:block",
                        "lg:mt-3 lg:text-sm lg:leading-6",
                      ].join(" ")}
                    >
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </RevealSection>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <RevealSection className="relative overflow-hidden bg-[#f1eee7] py-12 sm:py-14 lg:py-16">
          <div className="pointer-events-none absolute -right-44 -top-44 h-[420px] w-[420px] rounded-full border border-slate-900/5" />

          <div className="relative mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-6">
            <SectionHeading
              eyebrow="Selected for you"
              title="Featured Products"
              linkText="Shop all"
            />

            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {featured.map((product, index) => (
                <div
                  key={product.id}
                  style={{
                    "--item-delay": `${(index % 4) * 140}ms`,
                  }}
                  className="home-product-sequence min-w-0"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

     {/* Branding Banners */}
{brandingBanners.length > 0 && (
  <RevealSection
    className={[
      'mx-auto grid w-full max-w-[1180px]',
      'grid-cols-2 gap-3',
      'px-4 py-10',
      'sm:gap-4 sm:px-8 sm:py-14',
      'lg:grid-cols-2 lg:px-6 lg:py-16',
    ].join(' ')}
  >
    {brandingBanners.map(
      (banner, index) => (
        <Link
          key={banner.id || index}
          to={banner.link || '/shop'}
          style={{
            '--item-delay': `${
              (index % 2) * 180
            }ms`,
          }}
          className={[
            'home-banner-card group relative',
            'isolate flex min-w-0 items-end',
            'overflow-hidden bg-slate-950',

            /*
             * Mobile-এ দুইটি card পাশাপাশি থাকবে,
             * তাই height, radius ও shadow ছোট রাখা হয়েছে।
             */
            'min-h-[260px] rounded-[22px]',
            'shadow-[0_16px_40px_rgba(15,23,42,0.14)]',

            'sm:min-h-[360px] sm:rounded-[26px]',
            'sm:shadow-[0_20px_55px_rgba(15,23,42,0.15)]',

            index === 0 &&
            brandingBanners.length > 1
              ? 'lg:min-h-[500px]'
              : 'lg:min-h-[450px]',

            'lg:rounded-[30px]',
            'lg:shadow-[0_24px_65px_rgba(15,23,42,0.15)]',
          ].join(' ')}
        >
          {/* Banner Background */}
          <div
            className="home-banner-image absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={{
              backgroundImage: `
                linear-gradient(
                  90deg,
                  rgba(2, 6, 23, 0.88),
                  rgba(2, 6, 23, 0.16)
                ),
                url("${banner.image}")
              `,
            }}
          />

          {/* Bottom Gradient */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

          {/* Inner Border */}
          <span
            className={[
              'pointer-events-none absolute',
              'inset-2 rounded-[16px]',
              'border border-white/20',
              'sm:inset-3 sm:rounded-[20px]',
              'lg:rounded-[22px]',
            ].join(' ')}
          />

          {/* Banner Content */}
          <div
            className={[
              'relative z-10 min-w-0',
              'w-full p-4',
              'sm:p-6',
              'lg:max-w-xl lg:p-9',
            ].join(' ')}
          >
            {/* Kicker */}
            <span
              className={[
                'home-banner-kicker',
                'block truncate',
                'text-[7px] font-black',
                'uppercase tracking-[0.14em]',
                'text-white/75',
                'sm:text-[9px]',
                'sm:tracking-[0.2em]',
                'lg:text-[10px]',
                'lg:tracking-[0.24em]',
              ].join(' ')}
            >
              Exclusive edit
            </span>

            {/* Title */}
            <h2
              className={[
                'home-banner-title',
                'mt-2 break-words font-serif',
                'text-xl font-semibold',
                'leading-[1.05] text-white',
                'sm:mt-3 sm:text-3xl',
                'lg:mt-4 lg:text-5xl',
              ].join(' ')}
            >
              {banner.title}
            </h2>

            {/* Subtitle */}
            {banner.subtitle && (
              <p
                className={[
                  'home-banner-subtitle',
                  'mt-2 overflow-hidden',
                  'text-[10px] leading-4',
                  'text-slate-200',
                  'sm:mt-3 sm:text-xs',
                  'sm:leading-5',
                  'lg:mt-4 lg:max-w-lg',
                  'lg:text-sm lg:leading-7',
                ].join(' ')}
                style={{
                  display:
                    '-webkit-box',

                  WebkitBoxOrient:
                    'vertical',

                  WebkitLineClamp: 3,
                }}
              >
                {banner.subtitle}
              </p>
            )}

            {/* Button */}
            <span
              className={[
                'home-banner-button',
                'mt-4 inline-flex',
                'max-w-full items-center',
                'gap-1.5 rounded-full',
                'bg-white px-3 py-2',
                'text-[9px] font-black',
                'text-slate-950',
                'shadow-sm transition',
                'duration-300',
                'group-hover:bg-[var(--secondary-color)]',
                'group-hover:text-[var(--on-secondary)]',

                'sm:mt-5 sm:gap-2',
                'sm:px-4 sm:py-2.5',
                'sm:text-[11px]',

                'lg:mt-6 lg:px-5',
                'lg:py-3 lg:text-xs',
              ].join(' ')}
            >
              <span className="truncate">
                {banner.buttonText ||
                  'Explore'}
              </span>

              <ArrowRight
                size={15}
                className={[
                  'shrink-0',
                  'transition-transform',
                  'duration-500',
                  'group-hover:translate-x-1',
                ].join(' ')}
              />
            </span>
          </div>
        </Link>
      ),
    )}
  </RevealSection>
)}

      {/* New Arrivals */}
      {modelImages.length > 0 && (
        <RevealSection className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 sm:py-14 lg:px-6 lg:py-16">
          <div className="flex flex-col gap-3">
            <span className="home-heading-eyebrow text-[10px] font-black uppercase tracking-[0.24em] text-[var(--store-secondary)]">
              Campaign gallery
            </span>

            <h2 className="home-heading-title font-serif text-4xl font-semibold leading-tight tracking-[-0.035em] text-[var(--store-primary)] sm:text-5xl">
              New Arrivals
            </h2>

            <p className="home-arrival-description max-w-2xl text-sm leading-7 text-slate-500">
              Fresh model looks selected for this season.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-12 lg:auto-rows-[235px]">
            {modelImages.map((item, index) => {
              const layoutClass =
                index === 0
                  ? "col-span-2 lg:col-span-7 lg:row-span-2"
                  : index === 1
                    ? "lg:col-span-5"
                    : index === 2
                      ? "lg:col-span-5"
                      : "lg:col-span-4";

              return (
                <article
                  key={item.id || index}
                  style={{
                    "--item-delay": `${(index % 4) * 150}ms`,
                  }}
                  className={[
                    "home-arrival-card group relative isolate min-h-[285px] overflow-hidden rounded-[26px] bg-slate-950",
                    "shadow-[0_20px_55px_rgba(15,23,42,0.14)]",
                    layoutClass,
                  ].join(" ")}
                >
                  <img
                    src={item.image}
                    alt={
                      item.alt || item.title || `New arrival model ${index + 1}`
                    }
                    loading="lazy"
                    className="home-arrival-image absolute inset-0 h-full w-full object-cover"
                  />

                  <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                  <span className="pointer-events-none absolute inset-3 rounded-[18px] border border-white/15" />

                  <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
                    <span className="home-arrival-kicker text-[9px] font-black uppercase tracking-[0.2em] text-white/75 sm:text-[10px]">
                      {item.kicker || "New season"}
                    </span>

                    <h3
                      className={[
                        "home-arrival-title mt-2 font-serif font-semibold text-white",
                        index === 0
                          ? "text-3xl sm:text-4xl"
                          : "text-xl sm:text-2xl",
                      ].join(" ")}
                    >
                      {item.title || "Fresh Arrival"}
                    </h3>

                    {item.subtitle && (
                      <p className="home-arrival-subtitle mt-2 max-w-md text-sm leading-6 text-slate-200">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </RevealSection>
      )}
    </main>
  );
}

function RevealSection({ children, className = "", delay = 0, style }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={["home-reveal", visible ? "is-visible" : "", className].join(
        " ",
      )}
      style={{
        ...style,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </section>
  );
}

function SectionHeading({ eyebrow, title, linkText }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="home-heading-eyebrow text-[10px] font-black uppercase tracking-[0.24em] text-[var(--store-secondary)]">
          {eyebrow}
        </span>

        <h2 className="home-heading-title mt-2 font-serif text-4xl font-semibold leading-tight tracking-[-0.035em] text-[var(--store-primary)] sm:text-5xl">
          {title}
        </h2>
      </div>

      <Link
        to="/shop"
        className="home-heading-link home-theme-link group inline-flex w-max items-center gap-2 border-b pb-1 text-sm font-black transition duration-500"
      >
        {linkText}

        <ArrowRight
          size={16}
          className="transition-transform duration-500 group-hover:translate-x-1"
        />
      </Link>
    </div>
  );
}

function getSafeColor(value, fallback) {
  const color = String(value || "").trim();

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    return `#${color
      .slice(1)
      .split("")
      .map((character) => character + character)
      .join("")}`;
  }

  return fallback;
}

function hexToRgba(hex, alpha = 1) {
  const normalized = getSafeColor(hex, DEFAULT_SECONDARY_COLOR).replace(
    "#",
    "",
  );

  const number = Number.parseInt(normalized, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}