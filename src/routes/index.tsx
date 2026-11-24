import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ShieldCheck, Truck, Wrench, Smartphone, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/Shell";
import { meta } from "@/lib/meta";

const HERO = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=900&fit=crop";
export const Route = createFileRoute("/")({
  head: () => {
    const m = meta("Car & Motorbike Spare Parts in Nairobi", "Shop genuine car and motorbike spare parts and accessories from Zawabu, Kirinyaga Road, Nairobi. Order online or send an enquiry.");
    return { meta: [...m.meta, { property: "og:image", content: HERO.replace("h=900", "h=630").replace("w=1600", "w=1200") }, { name: "twitter:image", content: HERO.replace("h=900", "h=630").replace("w=1600", "w=1200") }] };
  },
  component: Home,
});

function Home() {
  const { products } = useStore();
  const offers = products.filter((p) => p.oldPrice).slice(0, 4);
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32">
          <span className="inline-block rounded bg-accent px-3 py-1 font-display text-sm font-bold uppercase text-accent-foreground">Kirinyaga Road · Nairobi</span>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] md:text-7xl">The right part. <span className="text-primary">Right now.</span></h1>
          <p className="mt-4 max-w-xl text-lg text-ink-foreground/80">Spare parts for cars and motorbikes, plus every accessory your ride needs. Order online, pay with M-Pesa, pick up or get it delivered.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="btn btn-primary">Shop parts <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/contact" className="btn border border-ink-foreground/30 hover:border-accent hover:text-accent">Can't find a part? Ask us</Link>
          </div>
        </div>
      </section>
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          {[[ShieldCheck, "Genuine parts"], [Truck, "Nairobi delivery"], [Smartphone, "Pay via M-Pesa"], [Wrench, "Expert advice"]].map(([I, t]) => {
            const Ic = I as typeof ShieldCheck;
            return <div key={t as string} className="flex items-center gap-3"><Ic className="h-8 w-8 text-primary" /><span className="font-display uppercase">{t as string}</span></div>;
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-3xl font-bold">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => {
            const Ic = (Icons as unknown as Record<string, typeof ShieldCheck>)[c.icon] ?? Wrench;
            return <Link key={c.slug} to="/shop" search={{ cat: c.slug }} className="group flex flex-col items-start gap-3 rounded-lg border bg-card p-5 transition hover:border-primary hover:bg-ink hover:text-ink-foreground"><Ic className="h-8 w-8 text-primary" /><span className="font-display text-lg uppercase">{c.name}</span></Link>;
          })}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="flex items-end justify-between"><h2 className="text-3xl font-bold">Hot offers</h2><Link to="/shop" className="font-display uppercase text-primary">View all →</Link></div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{offers.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-6 rounded-xl bg-primary p-8 text-primary-foreground md:grid-cols-[1fr_auto] md:p-12">
          <div><h2 className="text-3xl font-bold">Looking for a specific part?</h2><p className="mt-2 opacity-90">Send us your vehicle make, model and year — we'll source it and quote you fast.</p></div>
          <Link to="/contact" className="btn bg-ink text-ink-foreground hover:bg-ink/90">Send an enquiry</Link>
        </div>
      </section>
    </>
  );
}
