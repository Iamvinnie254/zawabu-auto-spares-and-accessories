import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, LogOut, ExternalLink } from "lucide-react";
import { ApiError, useEnquiries, useLogin, useOrders } from "@/lib/api";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | Zawabu Auto Spares" }, { name: "description", content: "Zawabu store admin." }, { property: "og:title", content: "Zawabu Admin" }, { property: "og:description", content: "Zawabu store admin." }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function Login() {
  const setSession = useSession((s) => s.setSession);
  const login = useLogin();
  const [err, setErr] = useState("");
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <form onSubmit={async (e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.currentTarget)) as { email: string; password: string };
        setErr("");
        try {
          const result = await login.mutateAsync(f);
          setSession(result.accessToken, result.user);
        } catch (error) {
          setErr(error instanceof ApiError ? error.message : "Could not sign in");
        }
      }} className="w-full max-w-sm space-y-4 rounded-xl bg-card p-8">
        <div className="text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded bg-primary font-display text-2xl font-bold text-primary-foreground">Z</span><h1 className="mt-3 text-2xl font-bold">Staff login</h1></div>
        <input name="email" type="email" placeholder="Email" defaultValue="admin@zawabu.co.ke" className="field" />
        <input name="password" type="password" placeholder="Password" className="field" />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button className="btn btn-primary w-full" disabled={login.isPending}>{login.isPending ? "Signing in…" : "Sign in"}</button>
        <p className="text-center text-xs text-muted-foreground">Demo credentials are seeded by <code>bun run --cwd apps/api db:seed</code></p>
      </form>
    </div>
  );
}

const links = [
  { to: "/admin", label: "Dashboard", I: LayoutDashboard }, { to: "/admin/products", label: "Products", I: Package },
  { to: "/admin/orders", label: "Orders", I: ShoppingBag }, { to: "/admin/enquiries", label: "Enquiries", I: MessageSquare },
] as const;

function AdminLayout() {
  const token = useSession((s) => s.token);
  const user = useSession((s) => s.user);
  const clear = useSession((s) => s.clear);
  const nav = useNavigate();
  const { data: orders = [] } = useOrders(undefined, !!token);
  const { data: enquiries = [] } = useEnquiries(undefined, !!token);
  if (!token) return <Login />;
  const badge: Record<string, number> = {
    "/admin/orders": orders.filter((o) => o.status === "Pending").length,
    "/admin/enquiries": enquiries.filter((e) => e.status === "New").length,
  };
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col bg-ink text-ink-foreground md:w-60">
        <div className="flex items-center gap-2 p-5"><span className="grid h-9 w-9 place-items-center rounded bg-primary font-display font-bold text-primary-foreground">Z</span><span className="font-display text-lg uppercase">Admin</span></div>
        <nav className="flex gap-1 overflow-x-auto px-3 md:flex-col">
          {links.map(({ to, label, I }) => <Link key={to} to={to} activeOptions={{ exact: to === "/admin" }} className="flex items-center gap-3 rounded px-3 py-2 text-ink-foreground/70 hover:bg-ink-foreground/10" activeProps={{ className: "bg-primary text-primary-foreground" }}><I className="h-5 w-5" /> {label}{badge[to] ? <span className="ml-auto rounded-full bg-accent px-2 text-xs text-accent-foreground">{badge[to]}</span> : null}</Link>)}
        </nav>
        <div className="mt-auto hidden space-y-1 p-3 md:block">
          <p className="px-3 py-2 text-xs text-ink-foreground/50">{user?.name} · {user?.role}</p>
          <Link to="/" className="flex items-center gap-3 rounded px-3 py-2 text-ink-foreground/70 hover:bg-ink-foreground/10"><ExternalLink className="h-5 w-5" /> View site</Link>
          <button onClick={() => { clear(); nav({ to: "/" }); }} className="flex w-full items-center gap-3 rounded px-3 py-2 text-ink-foreground/70 hover:bg-ink-foreground/10"><LogOut className="h-5 w-5" /> Log out</button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10"><Outlet /></main>
    </div>
  );
}
