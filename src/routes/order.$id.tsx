import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { ksh } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/order/$id")({
  head: () => ({ meta: [{ title: "Order received | Zawabu Auto Spares" }, { name: "description", content: "Your order has been received." }, { property: "og:title", content: "Order received" }, { property: "og:description", content: "Your order has been received." }, { name: "robots", content: "noindex" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const o = useStore().orders.find((x) => x.id === id);
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
      <h1 className="mt-4 text-4xl font-bold">Order received!</h1>
      <p className="mt-2 text-muted-foreground">Order number <strong className="text-foreground">{id}</strong>. We'll call you to confirm shortly.</p>
      {o && <div className="mt-8 space-y-2 rounded-lg border bg-card p-6 text-left text-sm">
        {o.items.map((i) => <div key={i.id} className="flex justify-between"><span>{i.name} × {i.qty}</span><span>{ksh(i.price * i.qty)}</span></div>)}
        <hr /><div className="flex justify-between font-bold"><span>Total</span><span>{ksh(o.total)}</span></div>
        <p className="text-muted-foreground">{o.delivery} · {o.payment} · Status: {o.status}</p></div>}
      <div className="mt-8 flex justify-center gap-3"><Link to="/track" search={{ id }} className="btn btn-outline">Track order</Link><Link to="/shop" className="btn btn-primary">Keep shopping</Link></div>
    </div>
  );
}
