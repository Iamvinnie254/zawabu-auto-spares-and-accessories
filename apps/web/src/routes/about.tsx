import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTitle } from "@/components/site/Shell";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/about")({ head: () => meta("About Us", "Zawabu Auto Spares & Accessories — your trusted parts shop on Kirinyaga Road, Nairobi."), component: About });

function About() {
  return (
    <>
      <PageTitle title="About Zawabu" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2">
        <img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=900&h=700&fit=crop" alt="Spare parts" className="rounded-xl" />
        <div className="space-y-4 text-lg">
          <h2 className="text-3xl font-bold">Parts for every ride</h2>
          <p className="text-muted-foreground">Zawabu Auto Spares & Accessories serves motorists, mechanics and boda boda riders from our shop on Kirinyaga Road — Nairobi's home of spare parts.</p>
          <p className="text-muted-foreground">We stock parts for cars and motorbikes, plus accessories to keep your vehicle looking and running its best. Not sure what fits? Our team will help you find the right part.</p>
          <div className="grid grid-cols-3 gap-4 pt-4">{[["Cars", "Saloons, SUVs, pickups"], ["Motorbikes", "Boda bodas & more"], ["Accessories", "Inside & out"]].map(([a, b]) => <div key={a} className="rounded-lg border-l-4 border-primary bg-card p-4"><b className="font-display uppercase">{a}</b><p className="text-sm text-muted-foreground">{b}</p></div>)}</div>
          <Link to="/shop" className="btn btn-primary">Shop now</Link>
        </div>
      </div>
    </>
  );
}
