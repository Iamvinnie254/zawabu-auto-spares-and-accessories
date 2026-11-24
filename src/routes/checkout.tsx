import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ksh } from "@/lib/data";
import { useStore } from "@/lib/store";
import { PageTitle } from "@/components/site/Shell";
import { meta } from "@/lib/meta";

export const DELIVERY_FEE = 300;
const schema = z.object({
  customer: z.string().trim().min(2, "Enter your name").max(100),
  phone: z.string().trim().regex(/^(\+?254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  location: z.string().trim().max(200).default(""),
});
export const Route = createFileRoute("/checkout")({ head: () => meta("Checkout", "Complete your spare parts order."), component: Checkout });

function Checkout() {
  const { cart, products, subtotal, placeOrder, clear } = useStore();
  const nav = useNavigate();
  const [delivery, setDelivery] = useState<"Pickup" | "Delivery">("Pickup");
  const [payment, setPayment] = useState<"M-Pesa" | "Cash on Delivery">("M-Pesa");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fee = delivery === "Delivery" ? DELIVERY_FEE : 0;
  if (!cart.length) return <div className="mx-auto max-w-xl p-16 text-center"><p>Your cart is empty.</p><Link to="/shop" className="btn btn-primary mt-4">Shop parts</Link></div>;
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const r = schema.safeParse(f);
    if (!r.success) { setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]))); return; }
    if (delivery === "Delivery" && !r.data.location) { setErrors({ location: "Enter a delivery location" }); return; }
    const items = cart.map((i) => { const p = products.find((x) => x.id === i.id)!; return { id: p.id, name: p.name, qty: i.qty, price: p.price }; });
    const o = placeOrder({ ...r.data, location: delivery === "Pickup" ? "Pickup - Kirinyaga Rd" : r.data.location, delivery, payment, items, total: subtotal + fee });
    clear();
    nav({ to: "/order/$id", params: { id: o.id } });
  };
  const Opt = <T extends string>({ v, cur, set, desc }: { v: T; cur: T; set: (v: T) => void; desc: string }) => (
    <button type="button" onClick={() => set(v)} className={`rounded-lg border p-4 text-left ${cur === v ? "border-primary bg-primary/5" : "bg-card"}`}><span className="font-display uppercase">{v}</span><span className="block text-sm text-muted-foreground">{desc}</span></button>);
  return (
    <>
      <PageTitle title="Checkout" />
      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section className="space-y-4 rounded-lg border bg-card p-6"><h2 className="text-xl">Your details</h2>
            <F e={errors} name="customer" label="Full name" /><div className="grid gap-4 md:grid-cols-2"><F e={errors} name="phone" label="Phone (M-Pesa)" placeholder="0712 345 678" /><F e={errors} name="email" label="Email" type="email" /></div></section>
          <section className="space-y-4 rounded-lg border bg-card p-6"><h2 className="text-xl">Delivery</h2>
            <div className="grid gap-3 md:grid-cols-2"><Opt v="Pickup" cur={delivery} set={setDelivery} desc="Free — collect at Kirinyaga Road" /><Opt v="Delivery" cur={delivery} set={setDelivery} desc={`${ksh(DELIVERY_FEE)} within Nairobi`} /></div>
            {delivery === "Delivery" && <F e={errors} name="location" label="Delivery location / landmark" />}</section>
          <section className="space-y-4 rounded-lg border bg-card p-6"><h2 className="text-xl">Payment</h2>
            <div className="grid gap-3 md:grid-cols-2"><Opt v="M-Pesa" cur={payment} set={setPayment} desc="We'll send a payment prompt to your phone" /><Opt v="Cash on Delivery" cur={payment} set={setPayment} desc="Pay when you receive or collect" /></div></section>
        </div>
        <aside className="h-fit space-y-3 rounded-lg border bg-card p-6"><h2 className="text-xl">Order summary</h2>
          {cart.map((i) => { const p = products.find((x) => x.id === i.id); return p && <div key={i.id} className="flex justify-between text-sm"><span>{p.name} × {i.qty}</span><span>{ksh(p.price * i.qty)}</span></div>; })}
          <hr /><div className="flex justify-between text-sm"><span>Subtotal</span><span>{ksh(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Delivery</span><span>{fee ? ksh(fee) : "Free"}</span></div>
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{ksh(subtotal + fee)}</span></div>
          <button className="btn btn-primary w-full">Place order</button>
        </aside>
      </form>
    </>
  );
}

function F({ name, label, e, ...rest }: { name: string; label: string; e: Record<string, string> } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block"><span className="mb-1 block text-sm font-medium">{label}</span><input name={name} className="field" {...rest} />{e[name] && <span className="text-sm text-destructive">{e[name]}</span>}</label>;
}
