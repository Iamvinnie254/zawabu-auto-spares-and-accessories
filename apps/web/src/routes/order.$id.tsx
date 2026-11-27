import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { ksh } from "@/lib/data";
import { useOrder } from "@/lib/api";
import { useSession } from "@/lib/session";
import { OrderConfirmationSkeleton } from "@/components/ui/skeletons";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/order/$id")({
  validateSearch: z.object({ phone: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Order received | Zawabu Auto Spares" },
      { name: "description", content: "Your order has been received." },
      { property: "og:title", content: "Order received" },
      { property: "og:description", content: "Your order has been received." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { phone } = Route.useSearch();
  const token = useSession((s) => s.token);
  const { data: fetched, isPending } = useOrder(id, !!token);
  const local = readLastOrder(id);
  const o = fetched ?? local;
  if (token && isPending && !local) return <OrderConfirmationSkeleton />;
  return (
    <div className="mx-auto max-w-xl animate-fade-in px-4 py-10 text-center sm:py-16">
      <CheckCircle2 className="animate-float mx-auto h-14 w-14 text-success sm:h-16 sm:w-16" />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Order received!</h1>
      <p className="mt-2 text-muted-foreground">
        Order number <strong className="text-foreground">{o?.orderNumber ?? id}</strong>. We'll call
        you to confirm shortly.
      </p>
      {o && (
        <div className="mt-8 space-y-2 rounded-lg border bg-card p-5 text-left text-sm sm:p-6">
          {o.items.map((i) => (
            <div key={i.id} className="flex flex-wrap justify-between gap-2">
              <span>
                {i.name} × {i.qty}
              </span>
              <span>{ksh(i.price * i.qty)}</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{ksh(o.total)}</span>
          </div>
          <p className="text-muted-foreground">
            {o.delivery} · {o.payment} · Status: {o.status}
          </p>
        </div>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/track"
          search={{ id: o?.orderNumber ?? id, phone: phone ?? "" }}
          className="btn btn-outline w-full sm:w-auto"
        >
          Track order
        </Link>
        <Link to="/shop" className="btn btn-primary w-full sm:w-auto">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

function readLastOrder(id: string): Order | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = JSON.parse(sessionStorage.getItem("zw_last_order") ?? "null") as Order | null;
    return saved?.id === id ? saved : null;
  } catch {
    return null;
  }
}
