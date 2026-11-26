import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, Phone, ShoppingCart, Menu, X, Clock, Mail } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { ksh, type Product } from "@/lib/data";

export const PHONE = "0700 000 000";
const nav = [
  { to: "/", label: "Home" }, { to: "/shop", label: "Shop" }, { to: "/about", label: "About" }, { to: "/contact", label: "Contact & Enquiries" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/admin")) return <>{children}</>;
  return <div className="flex min-h-screen flex-col"><Header /><main className="flex-1">{children}</main><Footer /></div>;
}

function Header() {
  const { count } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-ink text-ink-foreground">
      <div className="hidden bg-primary text-primary-foreground text-sm md:block">
        <div className="mx-auto flex max-w-7xl justify-between px-4 py-1.5">
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kirinyaga Road, Nairobi</span>
          <span className="flex items-center gap-4"><span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {PHONE}</span><span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Mon–Sat 8am–6pm</span></span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded bg-primary font-display text-xl font-bold text-primary-foreground">Z</span>
          <span className="leading-none"><span className="block font-display text-xl font-bold uppercase tracking-wide">Zawabu</span><span className="text-xs text-ink-foreground/60">Auto Spares & Accessories</span></span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {nav.map((n) => <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="font-display uppercase tracking-wide text-ink-foreground/80 hover:text-accent" activeProps={{ className: "text-accent" }}>{n.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative rounded p-2 hover:bg-ink-foreground/10" aria-label="Cart">
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">{count}</span>}
          </Link>
          <button className="p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <nav className="flex flex-col border-t border-ink-foreground/10 px-4 py-2 md:hidden">{nav.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2 font-display uppercase">{n.label}</Link>)}</nav>}
      <div className="stripe-bg h-1.5" />
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 bg-ink text-ink-foreground/80">
      <div className="stripe-bg h-1.5" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2"><h3 className="text-xl text-ink-foreground">Zawabu Auto Spares</h3><p className="mt-2 max-w-sm text-sm">Genuine and quality spare parts for cars and motorbikes, plus accessories — right on Kirinyaga Road, Nairobi.</p></div>
        <div><h4 className="text-ink-foreground">Shop</h4><ul className="mt-2 space-y-1 text-sm"><li><Link to="/shop">All products</Link></li><li><Link to="/cart">Cart</Link></li><li><Link to="/track">Track order</Link></li></ul></div>
        <div><h4 className="text-ink-foreground">Visit us</h4><ul className="mt-2 space-y-1 text-sm"><li className="flex gap-2"><MapPin className="h-4 w-4" /> Kirinyaga Rd, Nairobi</li><li className="flex gap-2"><Phone className="h-4 w-4" /> {PHONE}</li><li className="flex gap-2"><Mail className="h-4 w-4" /> info@zawabu.co.ke</li></ul></div>
      </div>
      <div className="border-t border-ink-foreground/10 py-4 text-center text-xs">© 2026 Zawabu Auto Spares & Accessories · <Link to="/admin" className="hover:text-accent">Staff login</Link></div>
    </footer>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const { add } = useStore();
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card transition hover:border-primary hover:shadow-lg">
      <Link to="/product/$id" params={{ id: p.id }} className="relative aspect-square overflow-hidden bg-muted">
        <img src={p.img} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        {p.oldPrice && <span className="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 font-display text-xs font-bold uppercase text-accent-foreground">Offer</span>}
        <span className="absolute right-2 top-2 rounded bg-ink/80 px-2 py-0.5 text-xs text-ink-foreground">{p.vehicle}</span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs uppercase text-muted-foreground">{p.brand}</span>
        <Link to="/product/$id" params={{ id: p.id }} className="font-semibold leading-tight hover:text-primary">{p.name}</Link>
        <div className="mt-2 flex items-baseline gap-2"><span className="font-display text-lg font-bold text-primary">{ksh(p.price)}</span>{p.oldPrice && <span className="text-sm text-muted-foreground line-through">{ksh(p.oldPrice)}</span>}</div>
        <button onClick={() => add(p.id)} disabled={p.stock === 0} className="btn btn-primary mt-auto w-full pt-2 text-sm disabled:opacity-50">{p.stock === 0 ? "Out of stock" : "Add to cart"}</button>
      </div>
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return <div className="bg-ink text-ink-foreground"><div className="mx-auto max-w-7xl px-4 py-10"><h1 className="text-4xl font-bold">{title}</h1>{sub && <p className="mt-1 text-ink-foreground/70">{sub}</p>}</div></div>;
}
