import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "./types";

const memory = new Map<string, string>();
const safeStorage = {
  getItem: (key: string) =>
    typeof window === "undefined" ? (memory.get(key) ?? null) : localStorage.getItem(key),
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") memory.set(key, value);
    else localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") memory.delete(key);
    else localStorage.removeItem(key);
  },
};

type CartInput = Pick<CartLine, "id" | "name" | "price" | "img">;
type CartState = {
  lines: CartLine[];
  add: (product: CartInput, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (product, qty = 1) =>
        set((s) => ({
          lines: s.lines.some((l) => l.id === product.id)
            ? s.lines.map((l) => (l.id === product.id ? { ...l, qty: l.qty + qty } : l))
            : [...s.lines, { ...product, qty }],
        })),
      setQty: (id, qty) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l)),
        })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "zw_cart_v2",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ lines: s.lines }),
      skipHydration: true,
    },
  ),
);

export const selectCartCount = (s: CartState) => s.lines.reduce((sum, line) => sum + line.qty, 0);
export const selectCartSubtotal = (s: CartState) =>
  s.lines.reduce((sum, line) => sum + line.price * line.qty, 0);
