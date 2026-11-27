import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ShieldCheck, Truck, Wrench, Smartphone, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { useProducts } from "@/lib/api";
import { ProductCard } from "@/components/site/Shell";
import { ProductGridSkeleton } from "@/components/ui/skeletons";
import { meta } from "@/lib/meta";

const HERO = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=900&fit=crop";
export const Route = createFileRoute("/")({
  head: () => {
    const m = meta(
      "Car & Motorbike Spare Parts in Nairobi",
      "Shop genuine car and motorbike spare parts and accessories from Zawabu, Kirinyaga Road, Nairobi. Order online or send an enquiry.",
    );
    return {
      meta: [
        ...m.meta,
        {
          property: "og:image",
          content: HERO.replace("h=900", "h=630").replace("w=1600", "w=1200"),
        },
        {
          name: "twitter:image",
          content: HERO.replace("h=900", "h=630").replace("w=1600", "w=1200"),
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { data: products = [], isPending } = useProducts();
  const offers = products.filter((p) => p.oldPrice).slice(0, 4);
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img
          src={HERO}
          alt=""
          className="animate-slow-zoom absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="relative mx-auto max-w-7xl animate-fade-up px-4 py-16 sm:px-6 sm:py-24 md:py-32">
          <span className="inline-block rounded bg-accent px-3 py-1 font-display text-xs font-bold uppercase text-accent-foreground sm:text-sm">
            Kirinyaga Road · Nairobi
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.08] sm:text-5xl md:text-7xl">
            The right part. <span className="text-primary">Right now.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-foreground/80 sm:text-lg">
            Spare parts for cars and motorbikes, plus every accessory your ride needs. Order online,
            pay with M-Pesa, pick up or get it delivered.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/shop" className="btn btn-primary w-full sm:w-auto">
              Shop parts <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="btn w-full border border-ink-foreground/30 hover:border-accent hover:text-accent sm:w-auto"
            >
              Can't find a part? Ask us
            </Link>
          </div>
        </div>
      </section>
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:gap-4 sm:px-6 md:grid-cols-4">
          {[
            [ShieldCheck, "Genuine parts"],
            [Truck, "Nairobi delivery"],
            [Smartphone, "Pay via M-Pesa"],
            [Wrench, "Expert advice"],
          ].map(([I, t]) => {
            const Ic = I as typeof ShieldCheck;
            return (
              <div key={t as string} className="flex items-center gap-2 sm:gap-3">
                <Ic className="h-6 w-6 shrink-0 text-primary sm:h-8 sm:w-8" />
                <span className="font-display text-xs uppercase sm:text-base">{t as string}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <h2 className="text-2xl font-bold sm:text-3xl">Shop by category</h2>
        <div className="stagger mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => {
            const Ic = (Icons as unknown as Record<string, typeof ShieldCheck>)[c.icon] ?? Wrench;
            return (
              <Link
                key={c.slug}
                to="/shop"
                search={{ cat: c.slug }}
                className="animate-fade-up group flex min-w-0 flex-col items-start gap-3 rounded-lg border bg-card p-4 hover-lift hover:border-primary hover:bg-ink hover:text-ink-foreground sm:p-5"
              >
                <Ic className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
                <span className="font-display text-base uppercase sm:text-lg">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold sm:text-3xl">Hot offers</h2>
          <Link to="/shop" className="font-display text-sm uppercase text-primary sm:text-base">
            View all →
          </Link>
        </div>
        {isPending ? (
          <ProductGridSkeleton className="mt-6" />
        ) : offers.length ? (
          <div className="stagger mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {offers.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground sm:p-10">
            New offers are on the way. Browse all parts in the meantime.
          </p>
        )}
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="grid items-center gap-6 rounded-xl bg-primary p-6 text-primary-foreground sm:p-8 md:grid-cols-[1fr_auto] md:p-12">
          <div className="animate-fade-up">
            <h2 className="text-2xl font-bold sm:text-3xl">Looking for a specific part?</h2>
            <p className="mt-2 text-sm opacity-90 sm:text-base">
              Send us your vehicle make, model and year — we'll source it and quote you fast.
            </p>
          </div>
          <Link
            to="/contact"
            className="btn w-full bg-ink text-ink-foreground hover:bg-ink/90 md:w-auto"
          >
            Send an enquiry
          </Link>
        </div>
      </section>
    </>
  );
}
