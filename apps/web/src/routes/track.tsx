import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useStore } from "@/lib/store";
import { PageTitle } from "@/components/site/Shell";
import { meta } from "@/lib/meta";
import { ksh } from "@/lib/data";

const STEPS = ["Pending", "Confirmed", "Dispatched", "Delivered"];
export const Route = createFileRoute("/track")({ validateSearch: z.object({ id: z.string().optional() }), head: () => meta("Track Your Order", "Check the status of your Zawabu order."), component: Track });

function Track() {
  const { id } = Route.useSearch();
  const [q, setQ] = useState(id ?? "");
  const [look, setLook] = useState(id ?? "");
  const o = useStore().orders.find((x) => x.id.toLowerCase() === look.trim().toLowerCase());
  const step = o ? STEPS.indexOf(o.status) : -1;
  return (
    <>
      <PageTitle title="Track order" sub="Enter your order number e.g. ZW-1042" />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <form onSubmit={(e) => { e.preventDefault(); setLook(q); }} className="flex gap-2"><input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order number" /><button className="btn btn-primary">Track</button></form>
        {look && (o ? <div className="mt-8 rounded-lg border bg-card p-6">
          <div className="flex justify-between"><strong>{o.id}</strong><span>{ksh(o.total)}</span></div>
          {o.status === "Cancelled" ? <p className="mt-4 text-destructive">This order was cancelled.</p> :
          <div className="mt-6 grid grid-cols-4 gap-2">{STEPS.map((s, i) => <div key={s} className="text-center"><div className={`h-2 rounded ${i <= step ? "bg-primary" : "bg-muted"}`} /><span className="mt-2 block text-xs font-display uppercase">{s}</span></div>)}</div>}
        </div> : <p className="mt-8 text-center text-muted-foreground">No order found with that number.</p>)}
      </div>
    </>
  );
}
