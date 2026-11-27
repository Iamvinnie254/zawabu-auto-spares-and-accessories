import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ksh, type OrderStatus } from "@/lib/data";
import { ApiError, useOrders, useUpdateOrder } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Status } from "@/components/site/Status";

export const Route = createFileRoute("/admin/orders")({ component: Orders });
const STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Dispatched", "Delivered", "Cancelled"];

function Orders() {
  const enabled = !!useSession((s) => s.token);
  const { data: orders = [] } = useOrders(undefined, enabled);
  const update = useUpdateOrder();
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");
  const list = orders.filter((o) => !filter || o.status === filter);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <select className="field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className="rounded-lg border bg-card">
            <button
              type="button"
              onClick={() => setOpen(open === o.id ? null : o.id)}
              className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left"
            >
              <span>
                <b>{o.orderNumber}</b>{" "}
                <span className="text-muted-foreground">
                  · {o.date} · {o.customer}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <b>{ksh(o.total)}</b>
                <Status s={o.status} />
              </span>
            </button>
            {open === o.id && (
              <div className="grid gap-4 border-t p-4 text-sm md:grid-cols-2">
                <div className="space-y-1">
                  <p>
                    <b>Phone:</b> {o.phone}
                  </p>
                  <p>
                    <b>Email:</b> {o.email || "—"}
                  </p>
                  <p>
                    <b>{o.delivery}:</b> {o.location}
                  </p>
                  <p>
                    <b>Payment:</b> {o.payment} · <Status s={o.paymentStatus} />
                  </p>
                  {o.notes && (
                    <p>
                      <b>Notes:</b> {o.notes}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  {o.items.map((i) => (
                    <p key={i.id} className="flex justify-between">
                      <span>
                        {i.name} × {i.qty}
                      </span>
                      <span>{ksh(i.lineTotal)}</span>
                    </p>
                  ))}
                  <label className="mt-3 flex items-center gap-2">
                    <b>Update status:</b>
                    <select
                      className="field w-auto"
                      value={o.status}
                      onChange={async (e) => {
                        try {
                          await update.mutateAsync({
                            id: o.id,
                            input: { status: e.target.value as OrderStatus },
                          });
                          setError("");
                        } catch (err) {
                          setError(err instanceof ApiError ? err.message : "Update failed");
                        }
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
