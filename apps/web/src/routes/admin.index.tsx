import { createFileRoute, Link } from "@tanstack/react-router";
import { ksh } from "@/lib/data";
import { useEnquiries, useLowStockProducts, useOrders } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Status } from "@/components/site/Status";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const enabled = !!useSession((s) => s.token);
  const { data: orders = [] } = useOrders(undefined, enabled);
  const { data: enquiries = [] } = useEnquiries(undefined, enabled);
  const { data: low = [] } = useLowStockProducts(enabled);
  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);
  const stats = [
    ["Revenue", ksh(revenue)],
    ["Orders", orders.length],
    ["Pending orders", orders.filter((o) => o.status === "Pending").length],
    ["New enquiries", enquiries.filter((e) => e.status === "New").length],
  ];
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([l, v]) => (
          <div
            key={l}
            className="rounded-lg border-l-4 border-primary bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="font-display text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <div className="mb-3 flex justify-between">
            <h2 className="text-lg">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary">
              All
            </Link>
          </div>
          {orders.slice(0, 5).map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between border-t py-2 text-sm"
            >
              <span>
                {o.orderNumber} · {o.customer}
              </span>
              <span className="flex items-center gap-3">
                {ksh(o.total)} <Status s={o.status} />
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="mb-3 flex justify-between">
            <h2 className="text-lg">Low stock</h2>
            <Link to="/admin/products" className="text-sm text-primary">
              Manage
            </Link>
          </div>
          {low.length ? (
            low.map((p) => (
              <div
                key={p.id}
                className="flex justify-between border-t py-2 text-sm"
              >
                <span>{p.name}</span>
                <span className="font-semibold text-destructive">
                  {p.stock} left
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">All stocked up.</p>
          )}
        </div>
      </div>
    </div>
  );
}
