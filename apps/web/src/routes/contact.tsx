import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MapPin, Phone, Clock, CheckCircle2, LoaderCircle } from "lucide-react";
import { ApiError, useCreateEnquiry } from "@/lib/api";
import { PageTitle, PHONE } from "@/components/site/Shell";
import { meta } from "@/lib/meta";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().min(2, "Add a subject").max(150),
  message: z.string().trim().min(5, "Tell us what you need").max(1000),
});
export const Route = createFileRoute("/contact")({
  validateSearch: z.object({ part: z.string().optional() }),
  head: () =>
    meta(
      "Contact & Enquiries",
      "Visit Zawabu on Kirinyaga Road, call us, or send a spare parts enquiry.",
    ),
  component: Contact,
});

function Err({ n, errors }: { n: string; errors: Record<string, string> }) {
  return errors[n] ? <span className="text-sm text-destructive">{errors[n]}</span> : null;
}

function Contact() {
  const { part } = Route.useSearch();
  const createEnquiry = useCreateEnquiry();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    try {
      await createEnquiry.mutateAsync(r.data);
      setErrors({});
      setSent(true);
    } catch (error) {
      setErrors({
        form:
          error instanceof ApiError ? error.message : "Could not send enquiry. Please try again.",
      });
    }
  };
  return (
    <>
      <PageTitle
        title="Contact & enquiries"
        sub="Can't find a part? Tell us your vehicle and we'll source it."
      />
      <div className="mx-auto grid max-w-6xl animate-fade-in gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_360px] lg:gap-10">
        {sent ? (
          <div className="animate-fade-in rounded-lg border bg-card p-6 text-center sm:p-10">
            <CheckCircle2 className="animate-float mx-auto h-12 w-12 text-success" />
            <h2 className="mt-3 text-xl sm:text-2xl">Enquiry sent</h2>
            <p className="text-muted-foreground">Thanks! Our team will get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium">Name</span>
                <input name="name" className="field" />
                <Err errors={errors} n="name" />
              </label>
              <label>
                <span className="text-sm font-medium">Phone</span>
                <input name="phone" className="field" />
                <Err errors={errors} n="phone" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input name="email" type="email" className="field" />
              <Err errors={errors} n="email" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Subject / part needed</span>
              <input name="subject" defaultValue={part} className="field" />
              <Err errors={errors} n="subject" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Message (include make, model, year)</span>
              <textarea name="message" rows={5} className="field" />
              <Err errors={errors} n="message" />
            </label>
            <Err errors={errors} n="form" />
            <button type="submit" className="btn btn-primary" disabled={createEnquiry.isPending}>
              {createEnquiry.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                "Send enquiry"
              )}
            </button>
          </form>
        )}
        <aside className="space-y-4">
          <div className="space-y-3 rounded-lg bg-ink p-6 text-ink-foreground">
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 shrink-0 text-accent" /> Kirinyaga Road, Nairobi CBD
            </p>
            <p className="flex items-start gap-3">
              <Phone className="mt-0.5 shrink-0 text-accent" /> {PHONE}
            </p>
            <p className="flex items-start gap-3">
              <Clock className="mt-0.5 shrink-0 text-accent" /> Mon–Sat, 8:00am – 6:00pm
            </p>
          </div>
          <iframe
            title="Map"
            className="h-56 w-full rounded-lg border sm:h-64"
            loading="lazy"
            src="https://maps.google.com/maps?q=Kirinyaga%20Road%20Nairobi&z=16&output=embed"
          />
        </aside>
      </div>
    </>
  );
}
