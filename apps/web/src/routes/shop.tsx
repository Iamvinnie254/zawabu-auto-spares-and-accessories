import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CATEGORIES } from "@/lib/data";
import { useProducts, type ProductFilters } from "@/lib/api";
import { PageTitle, ProductCard } from "@/components/site/Shell";
import { meta } from "@/lib/meta";

const search = z.object({ cat: z.string().optional(), q: z.string().optional(), v: z.string().optional(), sort: z.string().optional() });
export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => meta("Shop Spare Parts", "Browse brakes, engine parts, filters, electrical, tyres, motorbike parts and accessories."),
  component: Shop,
});

function Shop() {
  const { cat, q, v, sort } = Route.useSearch();
  const nav = useNavigate({ from: "/shop" });
  const { data: products = [], isLoading } = useProducts({
    search: q,
    category: cat,
    vehicle: v as ProductFilters["vehicle"],
  });
  const set = (k: string, val?: string) => nav({ search: (s) => ({ ...s, [k]: val || undefined }) });
  let list = products.filter((p) => (!cat || p.category === cat) && (!v || p.vehicle === v) && (!q || (p.name + p.brand).toLowerCase().includes(q.toLowerCase())));
  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
  return (
    <>
      <PageTitle title="Shop" sub="Car & motorbike spare parts and accessories" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <input className="field" placeholder="Search parts…" defaultValue={q} onChange={(e) => set("q", e.target.value)} />
          <div><h3 className="mb-2 text-sm">Category</h3>
            <div className="flex flex-col gap-1">
              <button onClick={() => set("cat")} className={`rounded px-3 py-1.5 text-left ${!cat ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>All</button>
              {CATEGORIES.map((c) => <button key={c.slug} onClick={() => set("cat", c.slug)} className={`rounded px-3 py-1.5 text-left ${cat === c.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{c.name}</button>)}
            </div></div>
          <div><h3 className="mb-2 text-sm">Vehicle</h3>
            <select className="field" value={v ?? ""} onChange={(e) => set("v", e.target.value)}><option value="">All</option><option>Car</option><option>Motorbike</option><option>Universal</option></select></div>
        </aside>
        <div>
          <div className="mb-4 flex items-center justify-between"><span className="text-muted-foreground">{isLoading ? "Loading…" : `${list.length} products`}</span>
            <select className="field w-auto" value={sort ?? ""} onChange={(e) => set("sort", e.target.value)}><option value="">Sort: Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
          {list.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <p className="rounded-lg border bg-card p-10 text-center text-muted-foreground">No parts match. Try another search, or send us an enquiry.</p>}
        </div>
      </div>
    </>
  );
}
