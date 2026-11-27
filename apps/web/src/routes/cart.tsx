import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { ksh } from "@/lib/data";
import { selectCartSubtotal, useCart } from "@/lib/cart";
import { PageTitle } from "@/components/site/Shell";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/cart")({
  head: () => meta("Your Cart", "Review the spare parts in your cart."),
  component: Cart,
});

function Cart() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(selectCartSubtotal);
  return (
    <>
      <PageTitle title="Your cart" />
      <div className="mx-auto max-w-5xl px-4 py-10">
        {lines.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="btn btn-primary mt-4">
              Browse parts
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_300px]">
            <div className="divide-y rounded-lg border bg-card">
              {lines.map((line) => (
                <div key={line.id} className="flex items-center gap-4 p-4">
                  <img src={line.img} alt="" className="h-20 w-20 rounded object-cover" />
                  <div className="flex-1">
                    <Link to="/product/$id" params={{ id: line.id }} className="font-semibold">
                      {line.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{ksh(line.price)}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={line.qty}
                    onChange={(e) => setQty(line.id, +e.target.value)}
                    className="field w-16"
                  />
                  <span className="w-24 text-right font-semibold">
                    {ksh(line.price * line.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(line.id)}
                    aria-label="Remove"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-lg border bg-card p-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">{ksh(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Delivery calculated at checkout</p>
              <Link to="/checkout" className="btn btn-primary mt-6 w-full">
                Checkout
              </Link>
              <Link to="/shop" className="mt-3 block text-center text-sm text-primary">
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
