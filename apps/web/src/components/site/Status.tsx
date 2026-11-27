const tone: Record<string, string> = {
  Pending: "bg-accent/30 text-accent-foreground",
  New: "bg-accent/30 text-accent-foreground",
  Confirmed: "bg-primary/15 text-primary",
  Dispatched: "bg-primary/15 text-primary",
  Delivered: "bg-success/15 text-success",
  Replied: "bg-success/15 text-success",
  Cancelled: "bg-destructive/15 text-destructive",
};
export function Status({ s }: { s: string }) {
  const active = s === "Pending" || s === "New";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[s] ?? "bg-muted"}`}
    >
      {active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {s}
    </span>
  );
}
