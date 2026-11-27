import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { CATEGORIES, catName, fallbackImage, ksh, type Product } from "@/lib/data";
import {
  ApiError,
  useDeleteProduct,
  useProducts,
  useSaveProduct,
  type ProductEditorInput,
} from "@/lib/api";
import { useSession } from "@/lib/session";
import { AdminRowsSkeleton } from "@/components/ui/skeletons";

export const Route = createFileRoute("/admin/products")({
  component: Products,
});
const blank: Product = {
  id: "",
  sku: "",
  name: "",
  category: "engine",
  vehicle: "Car",
  make: "",
  model: "",
  yearFrom: null,
  yearTo: null,
  engine: "",
  partNumber: "",
  brand: "",
  condition: "Aftermarket",
  price: 0,
  oldPrice: null,
  stock: 0,
  lowStockThreshold: 5,
  description: "",
  img: fallbackImage,
  isActive: true,
  createdAt: "",
  updatedAt: "",
};

function Products() {
  const enabled = !!useSession((s) => s.token);
  const { data: products = [], isPending } = useProducts({}, enabled);
  const save = useSaveProduct();
  const remove = useDeleteProduct();
  const [edit, setEdit] = useState<Product | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Products</h1>
        <div className="flex w-full gap-2 sm:w-auto">
          <input
            className="field w-full sm:w-56"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setEdit(blank)}
            className="btn btn-primary w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              {["Product", "Category", "Price", "Stock", ""].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap p-3 font-display text-xs uppercase sm:text-sm"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enabled && isPending ? (
              <AdminRowsSkeleton rows={5} columns={5} />
            ) : (
              list.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="min-w-[180px] p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.img} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                      <div className="min-w-0">
                        <b className="line-clamp-2 text-sm">{p.name}</b>
                        <p className="text-xs text-muted-foreground">
                          {p.brand} · {p.vehicle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-3">{catName(p.category)}</td>
                  <td className="whitespace-nowrap p-3">{ksh(p.price)}</td>
                  <td
                    className={`whitespace-nowrap p-3 font-semibold ${p.stock <= p.lowStockThreshold ? "text-destructive" : ""}`}
                  >
                    {p.stock}
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEdit(p)}
                      className="p-1 hover:text-primary"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete ${p.name}?`)) {
                          try {
                            await remove.mutateAsync(p.id);
                          } catch (e) {
                            setError(e instanceof ApiError ? e.message : "Delete failed");
                          }
                        }
                      }}
                      className="p-1 hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {edit && (
        <Editor
          p={edit}
          onClose={() => setEdit(null)}
          onSave={async (input, id) => {
            try {
              await save.mutateAsync({ ...input, id });
              setEdit(null);
              setError("");
            } catch (e) {
              setError(e instanceof ApiError ? e.message : "Save failed");
            }
          }}
        />
      )}
    </div>
  );
}

function Editor({
  p,
  onClose,
  onSave,
}: {
  p: Product;
  onClose: () => void;
  onSave: (input: ProductEditorInput, id?: string) => void;
}) {
  const [f, setF] = useState(p);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setF({ ...f, [k]: v });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(
            {
              name: f.name,
              sku: f.sku || `ZW-${Date.now()}`,
              category: f.category,
              vehicle: f.vehicle as ProductEditorInput["vehicle"],
              make: f.make,
              model: f.model,
              yearFrom: f.yearFrom ?? undefined,
              yearTo: f.yearTo ?? undefined,
              engine: f.engine,
              partNumber: f.partNumber,
              brand: f.brand,
              condition: f.condition as ProductEditorInput["condition"],
              price: f.price,
              oldPrice: f.oldPrice ?? undefined,
              stock: f.stock,
              lowStockThreshold: f.lowStockThreshold,
              description: f.description,
              img: f.img || undefined,
              isActive: f.isActive,
            },
            f.id || undefined,
          );
        }}
        className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-xl bg-card p-4 sm:p-6"
      >
        <div className="flex justify-between">
          <h2 className="text-xl">{p.id ? "Edit" : "Add"} product</h2>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="field"
            placeholder="Name"
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <input
            className="field"
            placeholder="SKU"
            value={f.sku}
            onChange={(e) => set("sku", e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="field"
            placeholder="Brand"
            value={f.brand}
            onChange={(e) => set("brand", e.target.value)}
          />
          <select
            className="field"
            value={f.vehicle}
            onChange={(e) => set("vehicle", e.target.value as Product["vehicle"])}
          >
            <option>Car</option>
            <option>Motorbike</option>
            <option>Universal</option>
          </select>
          <select
            className="field sm:col-span-2"
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="text-sm">
            Price (KSh)
            <input
              type="number"
              min={1}
              className="field"
              value={f.price}
              onChange={(e) => set("price", +e.target.value)}
            />
          </label>
          <label className="text-sm">
            Stock
            <input
              type="number"
              min={0}
              className="field"
              value={f.stock}
              onChange={(e) => set("stock", +e.target.value)}
            />
          </label>
          <label className="text-sm">
            Low stock at
            <input
              type="number"
              min={0}
              className="field"
              value={f.lowStockThreshold}
              onChange={(e) => set("lowStockThreshold", +e.target.value)}
            />
          </label>
          <select
            className="field"
            value={f.condition}
            onChange={(e) => set("condition", e.target.value)}
          >
            {["Genuine", "OEM", "Aftermarket", "Ex-Japan"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <input
          className="field"
          placeholder="Image URL"
          value={f.img}
          onChange={(e) => set("img", e.target.value)}
        />
        <textarea
          className="field"
          rows={3}
          placeholder="Description"
          value={f.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <button type="submit" className="btn btn-primary w-full">
          Save
        </button>
      </form>
    </div>
  );
}
