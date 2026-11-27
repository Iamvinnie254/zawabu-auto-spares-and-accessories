import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { catName, ksh } from "@/lib/data";
import { ApiError, productQueryOptions, useProducts } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/site/Shell";
import { ProductDetailSkeleton, ProductGridSkeleton } from "@/components/ui/skeletons";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params, context }) => {
    try {
      return await context.queryClient.ensureQueryData(productQueryOptions(params.id));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw notFound();
      throw error;
    }
  },
  pendingComponent: ProductDetailSkeleton,
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.name} | Zawabu Auto Spares` },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: loaderData.name },
            { property: "og:description", content: loaderData.description },
            { property: "og:type", content: "product" },
            { name: "twitter:card", content: "summary_large_image" },
            { property: "og:image", content: loaderData.img },
            { name: "twitter:image", content: loaderData.img },
          ],
        }
      : { meta: [{ title: "Part not found" }, { name: "robots", content: "noindex" }] },
  component: ProductPage,
});

function ProductPage() {
  const base = Route.useLoaderData();
  const { data: relatedProducts = [], isPending: relatedPending } = useProducts({
    category: base.category,
  });
  const p = relatedProducts.find((x) => x.id === base.id) ?? base;
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const nav = useNavigate();
  const related = relatedProducts.filter((x) => x.id !== p.id).slice(0, 4);
  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-8 sm:px-6 sm:py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
        <Link to="/shop">Shop</Link> /{" "}
        <Link to="/shop" search={{ cat: p.category }}>
          {catName(p.category)}
        </Link>{" "}
        / <span className="min-w-0 truncate">{p.name}</span>
      </nav>
      <div className="grid gap-8 sm:gap-10 md:grid-cols-2">
        <img
          src={p.img}
          alt={p.name}
          className="aspect-square w-full rounded-xl border object-cover"
        />
        <div>
          <span className="text-sm uppercase text-muted-foreground">
            {p.brand || p.condition} · {p.vehicle}
          </span>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{p.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            SKU {p.sku}
            {p.partNumber ? ` · OEM ${p.partNumber}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="font-display text-2xl font-bold text-primary sm:text-3xl">
              {ksh(p.price)}
            </span>
            {p.oldPrice && (
              <span className="text-sm text-muted-foreground line-through sm:text-lg">
                {ksh(p.oldPrice)}
              </span>
            )}
          </div>
          <p
            className={`mt-2 text-sm font-semibold ${p.stock > 5 ? "text-success" : "text-destructive"}`}
          >
            {p.stock === 0 ? "Out of stock" : p.stock > 5 ? "In stock" : `Only ${p.stock} left`}
          </p>
          <p className="mt-6 text-muted-foreground">
            {p.description || "Quality spare part for cars and motorbikes."}
          </p>
          {(p.make || p.model || p.engine) && (
            <p className="mt-2 text-sm text-muted-foreground">
              Fits: {[p.make, p.model, p.engine].filter(Boolean).join(" · ")}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-stretch gap-3 sm:flex-nowrap">
            <div className="flex shrink-0 items-center rounded border bg-card">
              <button
                type="button"
                className="px-3 py-2"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="w-10 text-center">{qty}</span>
              <button
                type="button"
                className="px-3 py-2"
                onClick={() => setQty(Math.min(qty + 1, p.stock || 1))}
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={!p.stock}
              onClick={() => {
                add(p, qty);
                setAdded(true);
              }}
              className="btn btn-primary min-w-0 flex-1 disabled:opacity-50"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added
                </>
              ) : (
                "Add to cart"
              )}
            </button>
          </div>
          <button
            type="button"
            disabled={!p.stock}
            onClick={() => {
              add(p, qty);
              nav({ to: "/checkout" });
            }}
            className="btn btn-outline mt-3 w-full"
          >
            Buy now
          </button>
          <Link
            to="/contact"
            search={{ part: p.name }}
            className="mt-4 flex items-center gap-2 text-sm text-primary"
          >
            <MessageSquare className="h-4 w-4" /> Ask about compatibility with your vehicle
          </Link>
        </div>
      </div>
      {relatedPending ? (
        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl font-bold sm:text-2xl">You may also need</h2>
          <ProductGridSkeleton className="mt-4" />
        </section>
      ) : related.length > 0 ? (
        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl font-bold sm:text-2xl">You may also need</h2>
          <div className="stagger mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
