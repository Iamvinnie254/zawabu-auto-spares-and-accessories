import { createFileRoute } from "@tanstack/react-router";
import { ApiError, useEnquiries, useUpdateEnquiry } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Status } from "@/components/site/Status";
import { AdminListSkeleton } from "@/components/ui/skeletons";

export const Route = createFileRoute("/admin/enquiries")({
  component: Enquiries,
});

function Enquiries() {
  const enabled = !!useSession((s) => s.token);
  const { data: enquiries = [], isPending } = useEnquiries(undefined, enabled);
  const update = useUpdateEnquiry();
  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Enquiries</h1>
      {enabled && isPending ? (
        <AdminListSkeleton count={4} />
      ) : (
        enquiries.map((e) => (
          <div key={e.id} className="hover-lift rounded-lg border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <b className="text-sm sm:text-base">{e.subject}</b>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {e.name} · {e.phone} · {e.email} · {e.date}
                </p>
              </div>
              <Status s={e.status} />
            </div>
            <p className="mt-3 text-sm sm:text-base">{e.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {e.email && (
                <a
                  href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject}`)}`}
                  className="btn btn-outline w-full text-xs sm:w-auto sm:text-sm"
                >
                  Reply by email
                </a>
              )}
              <a
                href={`https://wa.me/${e.phone.replace(/\D/g, "").replace(/^0/, "254")}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline w-full text-xs sm:w-auto sm:text-sm"
              >
                WhatsApp
              </a>
              {e.status === "New" && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await update.mutateAsync({
                        id: e.id,
                        input: { status: "Replied" },
                      });
                    } catch (error) {
                      window.alert(error instanceof ApiError ? error.message : "Update failed");
                    }
                  }}
                  className="btn btn-primary w-full text-xs sm:w-auto sm:text-sm"
                >
                  Mark replied
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
