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
      <div className="mx-auto max-w-5xl animate-fade-in px-4 py-8 sm:px-6 sm:py-10">
        {lines.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center sm:p-12">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="btn btn-primary mt-4">
              Browse parts
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_300px]">
            <div className="divide-y rounded-lg border bg-card">
              {lines.map((line) => (
                <div key={line.id} className="flex flex-wrap items-center gap-3 p-4 sm:gap-4">
                  <img
                    src={line.img}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded object-cover sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/product/$id"
                      params={{ id: line.id }}
                      className="line-clamp-2 text-sm font-semibold sm:text-base"
                    >
                      {line.name}
                    </Link>
                    <p className="text-xs text-muted-foreground sm:text-sm">{ksh(line.price)}</p>
                  </div>
                  <div className="ml-auto flex w-full items-center justify-end gap-2 sm:ml-0 sm:w-auto sm:gap-4">
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => setQty(line.id, +e.target.value)}
                      aria-label={`Quantity for ${line.name}`}
                      className="field w-14 sm:w-16"
                    />
                    <span className="w-20 text-right text-sm font-semibold sm:w-24 sm:text-base">
                      {ksh(line.price * line.qty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      aria-label="Remove"
                      className="p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-lg border bg-card p-5 sm:p-6">
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
