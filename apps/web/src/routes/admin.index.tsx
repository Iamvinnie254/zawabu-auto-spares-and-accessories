import { createFileRoute, Link } from "@tanstack/react-router";
import { ksh } from "@/lib/data";
import { useEnquiries, useLowStockProducts, useOrders } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Status } from "@/components/site/Status";
import { AdminDashboardSkeleton } from "@/components/ui/skeletons";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const enabled = !!useSession((s) => s.token);
  const { data: orders = [], isPending: ordersPending } = useOrders(undefined, enabled);
  const { data: enquiries = [], isPending: enquiriesPending } = useEnquiries(undefined, enabled);
  const { data: low = [], isPending: lowPending } = useLowStockProducts(enabled);
  if (enabled && (ordersPending || enquiriesPending || lowPending))
    return <AdminDashboardSkeleton />;
  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
  const stats = [
    ["Revenue", ksh(revenue)],
    ["Orders", orders.length],
    ["Pending orders", orders.filter((o) => o.status === "Pending").length],
    ["New enquiries", enquiries.filter((e) => e.status === "New").length],
  ];
  return (
    <div className="animate-fade-in space-y-6 sm:space-y-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(([l, v]) => (
          <div
            key={l}
            className="hover-lift rounded-lg border-l-4 border-primary bg-card p-4 sm:p-5"
          >
            <p className="text-xs text-muted-foreground sm:text-sm">{l}</p>
            <p className="truncate font-display text-xl font-bold sm:text-2xl">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 sm:p-5">
          <div className="mb-3 flex justify-between">
            <h2 className="text-lg">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary">
              All
            </Link>
          </div>
          {orders.slice(0, 5).map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-xs sm:text-sm"
            >
              <span className="min-w-0 truncate">
                {o.orderNumber} · {o.customer}
              </span>
              <span className="flex shrink-0 items-center gap-2 sm:gap-3">
                {ksh(o.total)} <Status s={o.status} />
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-card p-4 sm:p-5">
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
                className="flex flex-wrap justify-between gap-2 border-t py-2 text-xs sm:text-sm"
              >
                <span className="min-w-0 truncate">{p.name}</span>
                <span className="shrink-0 font-semibold text-destructive">{p.stock} left</span>
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
