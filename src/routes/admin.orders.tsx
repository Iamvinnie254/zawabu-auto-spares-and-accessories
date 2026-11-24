import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ksh, type OrderStatus } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Status } from "@/components/site/Status";

export const Route = createFileRoute("/admin/orders")({ component: Orders });
const STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Dispatched", "Delivered", "Cancelled"];

function Orders() {
  const { orders, setOrderStatus } = useStore();
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = orders.filter((o) => !filter || o.status === filter);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Orders</h1>
        <select className="field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      <div className="space-y-3">{list.map((o) => <div key={o.id} className="rounded-lg border bg-card">
        <button onClick={() => setOpen(open === o.id ? null : o.id)} className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left">
          <span><b>{o.id}</b> <span className="text-muted-foreground">· {o.date} · {o.customer}</span></span>
          <span className="flex items-center gap-3"><b>{ksh(o.total)}</b><Status s={o.status} /></span>
        </button>
        {open === o.id && <div className="grid gap-4 border-t p-4 text-sm md:grid-cols-2">
          <div className="space-y-1"><p><b>Phone:</b> {o.phone}</p><p><b>Email:</b> {o.email}</p><p><b>{o.delivery}:</b> {o.location}</p><p><b>Payment:</b> {o.payment}</p></div>
          <div className="space-y-1">{o.items.map((i) => <p key={i.id} className="flex justify-between"><span>{i.name} × {i.qty}</span><span>{ksh(i.price * i.qty)}</span></p>)}
            <label className="mt-3 flex items-center gap-2"><b>Update status:</b><select className="field w-auto" value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label></div>
        </div>}
      </div>)}</div>
    </div>
  );
}
