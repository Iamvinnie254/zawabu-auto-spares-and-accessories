import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  LogOut,
  ExternalLink,
  LoaderCircle,
} from "lucide-react";
import { ApiError, useEnquiries, useLogin, useOrders } from "@/lib/api";
import { useSession } from "@/lib/session";
import { SkeletonBadge } from "@/components/ui/skeletons";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Zawabu Auto Spares" },
      { name: "description", content: "Zawabu store admin." },
      { property: "og:title", content: "Zawabu Admin" },
      { property: "og:description", content: "Zawabu store admin." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function Login() {
  const setSession = useSession((s) => s.setSession);
  const login = useLogin();
  const [err, setErr] = useState("");
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = Object.fromEntries(new FormData(e.currentTarget)) as {
            email: string;
            password: string;
          };
          setErr("");
          try {
            const result = await login.mutateAsync(f);
            setSession(result.accessToken, result.user);
          } catch (error) {
            setErr(error instanceof ApiError ? error.message : "Could not sign in");
          }
        }}
        className="animate-fade-in w-full max-w-sm space-y-4 rounded-xl bg-card p-6 sm:p-8"
      >
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded bg-primary font-display text-2xl font-bold text-primary-foreground">
            Z
          </span>
          <h1 className="mt-3 text-2xl font-bold">Staff login</h1>
        </div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          defaultValue="admin@zawabu.co.ke"
          className="field"
        />
        <input name="password" type="password" placeholder="Password" className="field" />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={login.isPending}>
          {login.isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Demo credentials are seeded by <code>bun run --cwd apps/api db:seed</code>
        </p>
      </form>
    </div>
  );
}

const links = [
  { to: "/admin", label: "Dashboard", I: LayoutDashboard },
  { to: "/admin/products", label: "Products", I: Package },
  { to: "/admin/orders", label: "Orders", I: ShoppingBag },
  { to: "/admin/enquiries", label: "Enquiries", I: MessageSquare },
] as const;

function AdminLayout() {
  const token = useSession((s) => s.token);
  const user = useSession((s) => s.user);
  const clear = useSession((s) => s.clear);
  const nav = useNavigate();
  const { data: orders = [], isPending: ordersPending } = useOrders(undefined, !!token);
  const { data: enquiries = [], isPending: enquiriesPending } = useEnquiries(undefined, !!token);
  if (!token) return <Login />;
  const badge: Record<string, number> = {
    "/admin/orders": orders.filter((o) => o.status === "Pending").length,
    "/admin/enquiries": enquiries.filter((e) => e.status === "New").length,
  };
  return (
    <div className="animate-fade-in flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col bg-ink text-ink-foreground md:w-60">
        <div className="flex items-center gap-2 p-4 md:p-5">
          <span className="grid h-9 w-9 place-items-center rounded bg-primary font-display font-bold text-primary-foreground">
            Z
          </span>
          <span className="font-display text-lg uppercase">Admin</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-1 md:flex-col md:pb-0">
          {links.map(({ to, label, I }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/admin" }}
              className="flex shrink-0 items-center gap-2 rounded px-3 py-2 text-xs text-ink-foreground/70 hover:bg-ink-foreground/10 md:gap-3 md:text-sm"
              activeProps={{ className: "bg-primary text-primary-foreground" }}
            >
              <I className="h-5 w-5 shrink-0" /> {label}
              {to === "/admin/orders" && ordersPending ? (
                <SkeletonBadge className="ml-auto" />
              ) : to === "/admin/enquiries" && enquiriesPending ? (
                <SkeletonBadge className="ml-auto" />
              ) : badge[to] ? (
                <span className="ml-auto rounded-full bg-accent px-2 text-xs text-accent-foreground">
                  {badge[to]}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 p-3 md:mt-auto md:block md:space-y-1">
          <p className="hidden truncate px-3 py-2 text-xs text-ink-foreground/50 sm:block">
            {user?.name} · {user?.role}
          </p>
          <Link
            to="/"
            className="flex items-center gap-2 rounded px-3 py-2 text-xs text-ink-foreground/70 hover:bg-ink-foreground/10 md:gap-3 md:text-sm"
          >
            <ExternalLink className="h-5 w-5 shrink-0" />{" "}
            <span className="hidden sm:inline">View site</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              clear();
              nav({ to: "/" });
            }}
            className="flex items-center gap-2 rounded px-3 py-2 text-xs text-ink-foreground/70 hover:bg-ink-foreground/10 md:gap-3 md:text-sm"
          >
            <LogOut className="h-5 w-5 shrink-0" />{" "}
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
