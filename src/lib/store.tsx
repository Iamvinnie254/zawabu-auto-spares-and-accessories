import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS, SAMPLE_ENQUIRIES, SAMPLE_ORDERS, type Enquiry, type Order, type Product } from "./data";

type CartItem = { id: string; qty: number };
type Ctx = {
  cart: CartItem[]; add: (id: string, qty?: number) => void; setQty: (id: string, qty: number) => void;
  remove: (id: string) => void; clear: () => void; count: number; subtotal: number;
  products: Product[]; saveProduct: (p: Product) => void; deleteProduct: (id: string) => void;
  orders: Order[]; placeOrder: (o: Omit<Order, "id" | "date" | "status">) => Order; setOrderStatus: (id: string, s: Order["status"]) => void;
  enquiries: Enquiry[]; addEnquiry: (e: Omit<Enquiry, "id" | "date" | "status">) => void; markReplied: (id: string) => void;
  admin: boolean; setAdmin: (v: boolean) => void;
};
const StoreCtx = createContext<Ctx | null>(null);

function usePersist<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) try { setV(JSON.parse(raw)); } catch { /* ignore */ }
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(v)); }, [key, v, ready]);
  return [v, setV] as const;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = usePersist<CartItem[]>("zw_cart", []);
  const [products, setProducts] = usePersist<Product[]>("zw_products", PRODUCTS);
  const [orders, setOrders] = usePersist<Order[]>("zw_orders", SAMPLE_ORDERS);
  const [enquiries, setEnq] = usePersist<Enquiry[]>("zw_enq", SAMPLE_ENQUIRIES);
  const [admin, setAdmin] = usePersist<boolean>("zw_admin", false);

  const add = (id: string, qty = 1) => setCart((c) => c.find((i) => i.id === id) ? c.map((i) => i.id === id ? { ...i, qty: i.qty + qty } : i) : [...c, { id, qty }]);
  const setQty = (id: string, qty: number) => setCart((c) => c.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  const remove = (id: string) => setCart((c) => c.filter((i) => i.id !== id));
  const subtotal = cart.reduce((s, i) => s + (products.find((p) => p.id === i.id)?.price ?? 0) * i.qty, 0);
  const today = () => new Date().toISOString().slice(0, 10);

  const value: Ctx = {
    cart, add, setQty, remove, clear: () => setCart([]), count: cart.reduce((s, i) => s + i.qty, 0), subtotal,
    products,
    saveProduct: (p) => setProducts((ps) => ps.some((x) => x.id === p.id) ? ps.map((x) => x.id === p.id ? p : x) : [p, ...ps]),
    deleteProduct: (id) => setProducts((ps) => ps.filter((p) => p.id !== id)),
    orders,
    placeOrder: (o) => {
      const order: Order = { ...o, id: "ZW-" + (1043 + orders.length - SAMPLE_ORDERS.length), date: today(), status: "Pending" };
      setOrders((os) => [order, ...os]); return order;
    },
    setOrderStatus: (id, s) => setOrders((os) => os.map((o) => o.id === id ? { ...o, status: s } : o)),
    enquiries,
    addEnquiry: (e) => setEnq((es) => [{ ...e, id: "E-" + (211 + es.length - SAMPLE_ENQUIRIES.length), date: today(), status: "New" }, ...es]),
    markReplied: (id) => setEnq((es) => es.map((e) => e.id === id ? { ...e, status: "Replied" } : e)),
    admin, setAdmin,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
export const useStore = () => { const c = useContext(StoreCtx); if (!c) throw new Error("no store"); return c; };
