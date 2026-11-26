import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { catName, getProduct, ksh } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/Shell";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => { const p = getProduct(params.id); if (!p) throw notFound(); return p; },
  head: ({ loaderData }) => loaderData ? { meta: [
    { title: `${loaderData.name} | Zawabu Auto Spares` }, { name: "description", content: loaderData.description },
    { property: "og:title", content: loaderData.name }, { property: "og:description", content: loaderData.description },
    { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" },
    { property: "og:image", content: loaderData.img }, { name: "twitter:image", content: loaderData.img },
  ] } : { meta: [{ title: "Part not found" }, { name: "robots", content: "noindex" }] },
  component: ProductPage,
});

function ProductPage() {
  const base = Route.useLoaderData();
  const { products, add } = useStore();
  const p = products.find((x) => x.id === base.id) ?? base;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const nav = useNavigate();
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 text-sm text-muted-foreground"><Link to="/shop">Shop</Link> / <Link to="/shop" search={{ cat: p.category }}>{catName(p.category)}</Link> / {p.name}</nav>
      <div className="grid gap-10 md:grid-cols-2">
        <img src={p.img} alt={p.name} className="aspect-square w-full rounded-xl border object-cover" />
        <div>
          <span className="text-sm uppercase text-muted-foreground">{p.brand} · {p.vehicle}</span>
          <h1 className="mt-1 text-4xl font-bold">{p.name}</h1>
          <div className="mt-4 flex items-baseline gap-3"><span className="font-display text-3xl font-bold text-primary">{ksh(p.price)}</span>{p.oldPrice && <span className="text-lg text-muted-foreground line-through">{ksh(p.oldPrice)}</span>}</div>
          <p className={`mt-2 text-sm font-semibold ${p.stock > 5 ? "text-success" : "text-destructive"}`}>{p.stock === 0 ? "Out of stock" : p.stock > 5 ? "In stock" : `Only ${p.stock} left`}</p>
          <p className="mt-6 text-muted-foreground">{p.description}</p>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded border bg-card"><button className="px-3 py-2" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="w-10 text-center">{qty}</span><button className="px-3 py-2" onClick={() => setQty(qty + 1)}>+</button></div>
            <button disabled={!p.stock} onClick={() => { add(p.id, qty); setAdded(true); }} className="btn btn-primary flex-1 disabled:opacity-50">{added ? <><Check className="h-4 w-4" /> Added</> : "Add to cart"}</button>
          </div>
          <button disabled={!p.stock} onClick={() => { add(p.id, qty); nav({ to: "/checkout" }); }} className="btn btn-outline mt-3 w-full">Buy now</button>
          <Link to="/contact" search={{ part: p.name }} className="mt-4 flex items-center gap-2 text-sm text-primary"><MessageSquare className="h-4 w-4" /> Ask about compatibility with your vehicle</Link>
        </div>
      </div>
      {related.length > 0 && <section className="mt-16"><h2 className="text-2xl font-bold">You may also need</h2><div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div></section>}
    </div>
  );
}
