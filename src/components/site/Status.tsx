const tone: Record<string, string> = {
  Pending: "bg-accent/30 text-accent-foreground", New: "bg-accent/30 text-accent-foreground", Confirmed: "bg-primary/15 text-primary",
  Dispatched: "bg-primary/15 text-primary", Delivered: "bg-success/15 text-success", Replied: "bg-success/15 text-success", Cancelled: "bg-destructive/15 text-destructive",
};
export function Status({ s }: { s: string }) { return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[s] ?? "bg-muted"}`}>{s}</span>; }
