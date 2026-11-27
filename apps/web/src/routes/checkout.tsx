import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { DELIVERY_FEE_KES } from "@zawabu/shared";
import { ksh } from "@/lib/data";
import { selectCartSubtotal, useCart } from "@/lib/cart";
import { ApiError, useCreateOrder } from "@/lib/api";
import { PageTitle } from "@/components/site/Shell";
import { meta } from "@/lib/meta";

export const DELIVERY_FEE = DELIVERY_FEE_KES;
const schema = z.object({
  customer: z.string().trim().min(2, "Enter your name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  location: z.string().trim().max(200).default(""),
});
export const Route = createFileRoute("/checkout")({
  head: () => meta("Checkout", "Complete your spare parts order."),
  component: Checkout,
});

function Opt<T extends string>({
  v,
  cur,
  set,
  desc,
}: {
  v: T;
  cur: T;
  set: (v: T) => void;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={() => set(v)}
      className={`w-full rounded-lg border p-4 text-left transition hover-lift ${cur === v ? "border-primary bg-primary/5" : "bg-card"}`}
    >
      <span className="font-display text-sm uppercase sm:text-base">{v}</span>
      <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">{desc}</span>
    </button>
  );
}

function Checkout() {
  const lines = useCart((s) => s.lines);
  const subtotal = useCart(selectCartSubtotal);
  const clear = useCart((s) => s.clear);
  const createOrder = useCreateOrder();
  const nav = useNavigate();
  const [delivery, setDelivery] = useState<"Pickup" | "Delivery">("Pickup");
  const [payment, setPayment] = useState<"M-Pesa" | "Cash on Delivery">("M-Pesa");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fee = delivery === "Delivery" ? DELIVERY_FEE : 0;
  if (!lines.length)
    return (
      <div className="mx-auto max-w-xl animate-fade-in p-8 text-center sm:p-16">
        <p>Your cart is empty.</p>
        <Link to="/shop" className="btn btn-primary mt-4">
          Shop parts
        </Link>
      </div>
    );
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const r = schema.safeParse(f);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    if (delivery === "Delivery" && !r.data.location) {
      setErrors({ location: "Enter a delivery location" });
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        customer: r.data.customer,
        phone: r.data.phone,
        email: r.data.email,
        location: delivery === "Pickup" ? "Pickup - Kirinyaga Rd" : r.data.location,
        delivery,
        payment,
        items: lines.map((line) => ({ productId: line.id, qty: line.qty })),
      });
      sessionStorage.setItem("zw_last_order", JSON.stringify(order));
      clear();
      nav({
        to: "/order/$id",
        params: { id: order.id },
        search: { phone: r.data.phone },
      });
    } catch (error) {
      setErrors(
        error instanceof ApiError
          ? { form: error.message }
          : { form: "Could not place order. Please try again." },
      );
    }
  };
  return (
    <>
      <PageTitle title="Checkout" />
      <form
        onSubmit={submit}
        className="mx-auto grid max-w-6xl animate-fade-in gap-6 px-4 py-8 sm:px-6 sm:py-10 md:grid-cols-[1fr_320px] lg:gap-8 lg:grid-cols-[1fr_340px]"
      >
        <div className="space-y-6 sm:space-y-8">
          <section className="space-y-4 rounded-lg border bg-card p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl">Your details</h2>
            <F e={errors} name="customer" label="Full name" />
            <div className="grid gap-4 sm:grid-cols-2">
              <F e={errors} name="phone" label="Phone (M-Pesa)" placeholder="0712 345 678" />
              <F e={errors} name="email" label="Email" type="email" />
            </div>
          </section>
          <section className="space-y-4 rounded-lg border bg-card p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl">Delivery</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Opt
                v="Pickup"
                cur={delivery}
                set={setDelivery}
                desc="Free — collect at Kirinyaga Road"
              />
              <Opt
                v="Delivery"
                cur={delivery}
                set={setDelivery}
                desc={`${ksh(DELIVERY_FEE)} within Nairobi`}
              />
            </div>
            {delivery === "Delivery" && (
              <F e={errors} name="location" label="Delivery location / landmark" />
            )}
          </section>
          <section className="space-y-4 rounded-lg border bg-card p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl">Payment</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Opt
                v="M-Pesa"
                cur={payment}
                set={setPayment}
                desc="We'll send a payment prompt to your phone"
              />
              <Opt
                v="Cash on Delivery"
                cur={payment}
                set={setPayment}
                desc="Pay when you receive or collect"
              />
            </div>
          </section>
        </div>
        <aside className="h-fit space-y-3 rounded-lg border bg-card p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl">Order summary</h2>
          {lines.map((line) => (
            <div key={line.id} className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="min-w-0 flex-1">
                {line.name} × {line.qty}
              </span>
              <span className="shrink-0">{ksh(line.price * line.qty)}</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{ksh(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery</span>
            <span>{fee ? ksh(fee) : "Free"}</span>
          </div>
          <div className="flex justify-between text-base font-bold sm:text-lg">
            <span>Total</span>
            <span className="text-primary">{ksh(subtotal + fee)}</span>
          </div>
          {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={createOrder.isPending}>
            {createOrder.isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> Placing order…
              </>
            ) : (
              "Place order"
            )}
          </button>
        </aside>
      </form>
    </>
  );
}

function F({
  name,
  label,
  e,
  ...rest
}: {
  name: string;
  label: string;
  e: Record<string, string>;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input name={name} className="field" {...rest} />
      {e[name] && <span className="text-sm text-destructive">{e[name]}</span>}
    </label>
  );
}
