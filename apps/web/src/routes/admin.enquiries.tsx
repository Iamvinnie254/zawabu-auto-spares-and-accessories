import { createFileRoute } from "@tanstack/react-router";
import { ApiError, useEnquiries, useUpdateEnquiry } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Status } from "@/components/site/Status";

export const Route = createFileRoute("/admin/enquiries")({
  component: Enquiries,
});

function Enquiries() {
  const enabled = !!useSession((s) => s.token);
  const { data: enquiries = [] } = useEnquiries(undefined, enabled);
  const update = useUpdateEnquiry();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Enquiries</h1>
      {enquiries.map((e) => (
        <div key={e.id} className="rounded-lg border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <b>{e.subject}</b>
              <p className="text-sm text-muted-foreground">
                {e.name} · {e.phone} · {e.email} · {e.date}
              </p>
            </div>
            <Status s={e.status} />
          </div>
          <p className="mt-3">{e.message}</p>
          <div className="mt-4 flex gap-2">
            {e.email && (
              <a
                href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject}`)}`}
                className="btn btn-outline text-sm"
              >
                Reply by email
              </a>
            )}
            <a
              href={`https://wa.me/${e.phone.replace(/\D/g, "").replace(/^0/, "254")}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline text-sm"
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
                className="btn btn-primary text-sm"
              >
                Mark replied
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
