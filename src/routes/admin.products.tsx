import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { CATEGORIES, catName, ksh, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/products")({ component: Products });
const blank: Product = { id: "", name: "", category: "engine", vehicle: "Car", brand: "", price: 0, stock: 0, description: "", img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=600&fit=crop" };

function Products() {
  const { products, saveProduct, deleteProduct } = useStore();
  const [edit, setEdit] = useState<Product | null>(null);
  const [q, setQ] = useState("");
  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2"><input className="field w-56" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /><button onClick={() => setEdit(blank)} className="btn btn-primary"><Plus className="h-4 w-4" /> Add</button></div></div>
      <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
        <thead className="bg-muted text-left"><tr>{["Product", "Category", "Price", "Stock", ""].map((h) => <th key={h} className="p-3 font-display uppercase">{h}</th>)}</tr></thead>
        <tbody>{list.map((p) => <tr key={p.id} className="border-t">
          <td className="flex items-center gap-3 p-3"><img src={p.img} alt="" className="h-10 w-10 rounded object-cover" /><div><b>{p.name}</b><p className="text-xs text-muted-foreground">{p.brand} · {p.vehicle}</p></div></td>
          <td className="p-3">{catName(p.category)}</td><td className="p-3">{ksh(p.price)}</td>
          <td className={`p-3 font-semibold ${p.stock <= 5 ? "text-destructive" : ""}`}>{p.stock}</td>
          <td className="p-3 text-right"><button onClick={() => setEdit(p)} className="p-1 hover:text-primary" aria-label="Edit"><Pencil className="h-4 w-4" /></button><button onClick={() => confirm(`Delete ${p.name}?`) && deleteProduct(p.id)} className="p-1 hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button></td>
        </tr>)}</tbody></table></div>
      {edit && <Editor p={edit} onClose={() => setEdit(null)} onSave={(p) => { saveProduct(p); setEdit(null); }} />}
    </div>
  );
}

function Editor({ p, onClose, onSave }: { p: Product; onClose: () => void; onSave: (p: Product) => void }) {
  const [f, setF] = useState(p);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setF({ ...f, [k]: v });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4">
      <form onSubmit={(e) => { e.preventDefault(); if (!f.name.trim()) return; onSave({ ...f, id: f.id || "p" + Date.now() }); }} className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-xl bg-card p-6">
        <div className="flex justify-between"><h2 className="text-xl">{p.id ? "Edit" : "Add"} product</h2><button type="button" onClick={onClose}><X /></button></div>
        <input className="field" placeholder="Name" value={f.name} onChange={(e) => set("name", e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <input className="field" placeholder="Brand" value={f.brand} onChange={(e) => set("brand", e.target.value)} />
          <select className="field" value={f.vehicle} onChange={(e) => set("vehicle", e.target.value as Product["vehicle"])}><option>Car</option><option>Motorbike</option><option>Universal</option></select>
          <select className="field col-span-2" value={f.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
          <label className="text-sm">Price (KSh)<input type="number" min={0} className="field" value={f.price} onChange={(e) => set("price", +e.target.value)} /></label>
          <label className="text-sm">Stock<input type="number" min={0} className="field" value={f.stock} onChange={(e) => set("stock", +e.target.value)} /></label>
        </div>
        <input className="field" placeholder="Image URL" value={f.img} onChange={(e) => set("img", e.target.value)} />
        <textarea className="field" rows={3} placeholder="Description" value={f.description} onChange={(e) => set("description", e.target.value)} />
        <button className="btn btn-primary w-full">Save</button>
      </form>
    </div>
  );
}
