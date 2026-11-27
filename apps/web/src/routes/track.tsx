import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useTrackOrder } from "@/lib/api";
import { PageTitle } from "@/components/site/Shell";
import { OrderStatusSkeleton } from "@/components/ui/skeletons";
import { meta } from "@/lib/meta";
import { ksh } from "@/lib/data";

const STEPS = ["Pending", "Confirmed", "Dispatched", "Delivered"];
export const Route = createFileRoute("/track")({
  validateSearch: z.object({ id: z.string().optional(), phone: z.string().optional() }),
  head: () => meta("Track Your Order", "Check the status of your Zawabu order."),
  component: Track,
});

function Track() {
  const { id, phone } = Route.useSearch();
  const [q, setQ] = useState(id ?? "");
  const [phoneInput, setPhoneInput] = useState(phone ?? "");
  const [look, setLook] = useState(id ?? "");
  const [lookPhone, setLookPhone] = useState(phone ?? "");
  const { data: o, isFetching, isError } = useTrackOrder(look, lookPhone);
  const step = o ? STEPS.indexOf(o.status) : -1;
  return (
    <>
      <PageTitle
        title="Track order"
        sub="Enter your order number e.g. ZW-1042 and the phone used at checkout"
      />
      <div className="mx-auto max-w-2xl animate-fade-in px-4 py-8 sm:px-6 sm:py-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLook(q.trim());
            setLookPhone(phoneInput.trim());
          }}
          className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            className="field"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order number"
          />
          <input
            className="field"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Phone number"
          />
          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            Track
          </button>
        </form>
        {look &&
          (o ? (
            <div className="animate-fade-in mt-8 rounded-lg border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap justify-between gap-2">
                <strong>{o.orderNumber}</strong>
                <span>{ksh(o.total)}</span>
              </div>
              {o.status === "Cancelled" ? (
                <p className="mt-4 text-destructive">This order was cancelled.</p>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {STEPS.map((s, i) => (
                    <div key={s} className="text-center">
                      <div className={`h-2 rounded ${i <= step ? "bg-primary" : "bg-muted"}`} />
                      <span className="mt-2 block text-[10px] font-display uppercase sm:text-xs">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : isFetching ? (
            <OrderStatusSkeleton />
          ) : isError ? (
            <p className="mt-8 text-center text-muted-foreground">
              No order found with that number and phone.
            </p>
          ) : null)}
      </div>
    </>
  );
}
