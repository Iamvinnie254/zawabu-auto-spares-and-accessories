import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CARD_KEYS = ["card-1", "card-2", "card-3", "card-4", "card-5", "card-6"] as const;
const STEP_KEYS = ["step-1", "step-2", "step-3", "step-4"] as const;
const STAT_KEYS = ["stat-1", "stat-2", "stat-3", "stat-4"] as const;
const PANEL_KEYS = ["panel-1", "panel-2"] as const;
const ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6", "row-7", "row-8"] as const;
const COLUMN_KEYS = ["col-1", "col-2", "col-3", "col-4", "col-5", "col-6"] as const;

export function ProductCardSkeleton() {
  return (
    <div className="animate-fade-in rounded-lg border bg-card p-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2 px-1 pt-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-4 h-9 w-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-4", className)}>
      {CARD_KEYS.slice(0, Math.max(0, count)).map((id) => (
        <ProductCardSkeleton key={id} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-10">
      <Skeleton className="h-10 w-64 max-w-full" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <ProductGridSkeleton className="mt-8" />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-10">
      <Skeleton className="h-4 w-48 max-w-full" />
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-8 h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function OrderStatusSkeleton() {
  return (
    <div className="animate-fade-in mt-8 rounded-lg border bg-card p-6">
      <div className="flex justify-between gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STEP_KEYS.map((id) => (
          <Skeleton key={id} className="h-10" />
        ))}
      </div>
    </div>
  );
}

export function OrderConfirmationSkeleton() {
  return (
    <div className="animate-fade-in mx-auto max-w-xl px-4 py-16 text-center">
      <Skeleton className="mx-auto h-16 w-16 rounded-full" />
      <Skeleton className="mx-auto mt-4 h-9 w-64 max-w-full" />
      <Skeleton className="mx-auto mt-3 h-4 w-3/4" />
      <Skeleton className="mx-auto mt-8 h-40 w-full rounded-lg" />
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="animate-fade-in space-y-8">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_KEYS.map((id) => (
          <Skeleton key={id} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {PANEL_KEYS.map((id) => (
          <Skeleton key={id} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function AdminRowsSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <>
      {ROW_KEYS.slice(0, Math.max(0, rows)).map((rowId) => (
        <tr key={rowId} className="border-t">
          {COLUMN_KEYS.slice(0, Math.max(0, columns)).map((colId) => (
            <td key={colId} className="p-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function AdminListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {CARD_KEYS.slice(0, Math.max(0, count)).map((id) => (
        <div key={id} className="animate-fade-in rounded-lg border bg-card p-5">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonBadge({ className, ...props }: ComponentProps<"div">) {
  return <Skeleton className={cn("h-5 w-6 rounded-full", className)} {...props} />;
}
