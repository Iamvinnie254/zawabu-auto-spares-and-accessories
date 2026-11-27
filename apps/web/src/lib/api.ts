import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import type {
  CreateOrderInput,
  CreateProductInput,
  EnquiryInput,
  LoginInput,
  UpdateEnquiryInput,
  UpdateOrderInput,
} from "@zawabu/shared";
import { fallbackImage } from "./data";
import { useSession } from "./session";
import type { AuthUser, Enquiry, Order, OrderItem, Product } from "./types";

const clientBase = import.meta.env.DEV
  ? "http://localhost:4000/api"
  : import.meta.env.VITE_API_URL ?? "/api";
const serverBase = import.meta.env.VITE_API_SERVER_URL ?? "http://localhost:4000/api";
export const apiBase = typeof window === "undefined" ? serverBase : clientBase;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useSession.getState().token;
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new ApiError(response.status, message ?? `Request failed (${response.status})`);
  }

  return response.status === 204 ? (undefined as T) : response.json();
}

type RawProduct = Omit<Product, "make" | "model" | "engine" | "partNumber" | "brand" | "oldPrice" | "description" | "img"> & {
  make: string | null; model: string | null; engine: string | null; partNumber: string | null;
  brand: string | null; oldPrice: number | null; description: string | null; img: string | null;
};

type RawOrderItem = Omit<OrderItem, "price"> & { unitPrice: number };
type RawOrder = Omit<Order, "date" | "email" | "notes" | "items"> & {
  createdAt: string; email: string | null; notes: string | null; items: RawOrderItem[];
};

type RawEnquiry = Omit<Enquiry, "date" | "email"> & { createdAt: string; email: string | null };

const normalizeProduct = (p: RawProduct): Product => ({
  ...p,
  make: p.make ?? "",
  model: p.model ?? "",
  engine: p.engine ?? "",
  partNumber: p.partNumber ?? "",
  brand: p.brand ?? "",
  oldPrice: p.oldPrice ?? null,
  description: p.description ?? "",
  img: p.img || fallbackImage,
});

const normalizeOrder = (o: RawOrder): Order => ({
  ...o,
  date: o.createdAt.slice(0, 10),
  email: o.email ?? "",
  notes: o.notes ?? "",
  items: o.items.map(({ unitPrice, ...item }) => ({ ...item, price: unitPrice })),
});

const normalizeEnquiry = (e: RawEnquiry): Enquiry => ({
  ...e,
  date: e.createdAt.slice(0, 10),
  email: e.email ?? "",
});

export type ProductFilters = {
  search?: string;
  category?: string;
  vehicle?: "Car" | "Motorbike" | "Universal" | "";
  lowStock?: boolean;
};

const keys = {
  products: (filters: ProductFilters) => ["products", filters] as const,
  product: (id: string) => ["product", id] as const,
  orders: (status?: string) => ["orders", status ?? "all"] as const,
  order: (id: string) => ["order", id] as const,
  track: (orderNumber: string, phone: string) => ["track", orderNumber, phone] as const,
  enquiries: (status?: string) => ["enquiries", status ?? "all"] as const,
};

function productParams(filters: ProductFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.vehicle) params.set("vehicle", filters.vehicle);
  if (filters.lowStock) params.set("lowStock", "true");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function productsQueryOptions(
  filters: ProductFilters = {},
  enabled = true,
): UseQueryOptions<Product[], ApiError> {
  return {
    queryKey: keys.products(filters),
    queryFn: async () => (await apiFetch<RawProduct[]>(`/products${productParams(filters)}`)).map(normalizeProduct),
    enabled,
    staleTime: 30_000,
  };
}

export function productQueryOptions(id: string): UseQueryOptions<Product, ApiError> {
  return {
    queryKey: keys.product(id),
    queryFn: async () => normalizeProduct(await apiFetch<RawProduct>(`/products/${id}`)),
    staleTime: 30_000,
  };
}

export const useProducts = (filters: ProductFilters = {}, enabled = true) =>
  useQuery(productsQueryOptions(filters, enabled));
export const useProduct = (id: string) => useQuery(productQueryOptions(id));

export const useLowStockProducts = (enabled = true) =>
  useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: async () => (await apiFetch<RawProduct[]>("/products/low-stock")).map(normalizeProduct),
    enabled,
  });

export const useOrders = (status?: string, enabled = true) =>
  useQuery({
    queryKey: keys.orders(status),
    queryFn: async () => (await apiFetch<RawOrder[]>(`/orders${status ? `?status=${status}` : ""}`)).map(normalizeOrder),
    enabled,
  });

export const useOrder = (id: string, enabled = true) =>
  useQuery({
    queryKey: keys.order(id),
    queryFn: async () => normalizeOrder(await apiFetch<RawOrder>(`/orders/${id}`)),
    enabled,
  });

export const useTrackOrder = (orderNumber: string, phone: string) =>
  useQuery({
    queryKey: keys.track(orderNumber, phone),
    queryFn: () =>
      apiFetch<RawOrder>(
        `/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`,
      ).then(normalizeOrder),
    enabled: orderNumber.length > 2 && phone.length >= 9,
    retry: false,
  });

export const useEnquiries = (status?: string, enabled = true) =>
  useQuery({
    queryKey: keys.enquiries(status),
    queryFn: async () => (await apiFetch<RawEnquiry[]>(`/enquiries${status ? `?status=${status}` : ""}`)).map(normalizeEnquiry),
    enabled,
  });

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<{ accessToken: string; user: AuthUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      apiFetch<RawOrder>("/orders", { method: "POST", body: JSON.stringify(input) }).then(normalizeOrder),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrderInput }) =>
      apiFetch<RawOrder>(`/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }).then(normalizeOrder),
    onSuccess: (order) => {
      qc.setQueryData(keys.order(order.id), order);
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateEnquiry() {
  return useMutation({
    mutationFn: (input: EnquiryInput) =>
      apiFetch<RawEnquiry>("/enquiries", { method: "POST", body: JSON.stringify(input) }).then(normalizeEnquiry),
  });
}

export function useUpdateEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEnquiryInput }) =>
      apiFetch<RawEnquiry>(`/enquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }).then(normalizeEnquiry),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enquiries"] }),
  });
}

export type ProductEditorInput = Partial<Omit<CreateProductInput, "sku">> & {
  id?: string;
  sku: string;
};

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ProductEditorInput) =>
      apiFetch<RawProduct>(id ? `/products/${id}` : "/products", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(input),
      }).then(normalizeProduct),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
