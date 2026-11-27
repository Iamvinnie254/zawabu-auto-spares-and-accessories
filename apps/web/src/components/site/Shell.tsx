import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, Phone, ShoppingCart, Menu, X, Clock, Mail } from "lucide-react";
import { useState, type ReactNode } from "react";
import { selectCartCount, useCart } from "@/lib/cart";
import { ksh, type Product } from "@/lib/data";

export const PHONE = "0700 000 000";
const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact & Enquiries" },
] as const;

function BrandLogo({ className }: { className?: string }) {
  return (
    <img src="/logo.svg" alt="" aria-hidden="true" width={40} height={40} className={className} />
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/admin")) return <>{children}</>;
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const count = useCart(selectCartCount);
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-ink text-ink-foreground">
      <div className="hidden bg-primary text-primary-foreground text-xs sm:block sm:text-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-1 px-4 py-1.5 sm:px-6">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" /> Kirinyaga Road, Nairobi
          </span>
          <span className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4 shrink-0" /> {PHONE}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 shrink-0" /> Mon–Sat 8am–6pm
            </span>
          </span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <BrandLogo className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10" />
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-lg font-bold uppercase tracking-wide sm:text-xl">
              Zawabu
            </span>
            <span className="hidden text-xs text-ink-foreground/60 sm:block">
              Auto Spares & Accessories
            </span>
          </span>
        </Link>
        <nav className="hidden gap-4 text-sm lg:flex xl:gap-6">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="font-display uppercase tracking-wide text-ink-foreground/80 hover:text-accent"
              activeProps={{ className: "text-accent" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative rounded p-2 hover:bg-ink-foreground/10"
            aria-label="Cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="p-2.5 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="animate-fade-in flex flex-col border-t border-ink-foreground/10 px-4 pb-3 pt-1 sm:px-6 lg:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="border-b border-ink-foreground/10 py-3 font-display text-base uppercase last:border-0"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
      <div className="stripe-bg h-1.5" />
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 bg-ink text-ink-foreground/80">
      <div className="stripe-bg h-1.5" />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 md:py-12">
        <div className="col-span-2">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12" />
            <h3 className="text-xl text-ink-foreground">Zawabu Auto Spares</h3>
          </div>
          <p className="mt-2 max-w-sm text-sm">
            Genuine and quality spare parts for cars and motorbikes, plus accessories — right on
            Kirinyaga Road, Nairobi.
          </p>
        </div>
        <div>
          <h4 className="text-ink-foreground">Shop</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link to="/shop">All products</Link>
            </li>
            <li>
              <Link to="/cart">Cart</Link>
            </li>
            <li>
              <Link to="/track">Track order</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-ink-foreground">Visit us</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Kirinyaga Rd, Nairobi
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" /> {PHONE}
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" /> info@zawabu.co.ke
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10 px-4 py-4 text-center text-xs">
        © 2026 Zawabu Auto Spares & Accessories ·{" "}
        <Link to="/admin" className="hover:text-accent">
          Staff login
        </Link>
      </div>
    </footer>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  return (
    <div className="animate-fade-up group flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card hover-lift hover:border-primary">
      <Link
        to="/product/$id"
        params={{ id: p.id }}
        className="relative aspect-square overflow-hidden bg-muted"
      >
        <img
          src={p.img}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {p.oldPrice && (
          <span className="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 font-display text-[10px] font-bold uppercase text-accent-foreground sm:text-xs">
            Offer
          </span>
        )}
        <span className="absolute right-2 max-w-[45%] truncate rounded bg-ink/80 px-2 py-0.5 text-[10px] text-ink-foreground sm:text-xs">
          {p.vehicle}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <span className="truncate text-xs uppercase text-muted-foreground">{p.brand}</span>
        <Link
          to="/product/$id"
          params={{ id: p.id }}
          className="line-clamp-2 text-sm font-semibold leading-tight hover:text-primary sm:text-base"
        >
          {p.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-base font-bold text-primary sm:text-lg">
            {ksh(p.price)}
          </span>
          {p.oldPrice && (
            <span className="text-xs text-muted-foreground line-through sm:text-sm">
              {ksh(p.oldPrice)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => add(p)}
          disabled={p.stock === 0}
          className="btn btn-primary mt-auto w-full pt-2 text-xs disabled:opacity-50 sm:text-sm"
        >
          {p.stock === 0 ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="animate-fade-in bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink-foreground/70 sm:text-base">{sub}</p>}
      </div>
    </div>
  );
}
