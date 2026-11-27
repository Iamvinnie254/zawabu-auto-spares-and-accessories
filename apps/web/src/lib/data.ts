export type { CartLine, Enquiry, Order, OrderItem, OrderStatus, Product, AuthUser } from "./types";

export type Category = { slug: string; name: string; icon: string };

export const CATEGORIES: Category[] = [
  { slug: "engine", name: "Engine Parts", icon: "Cog" },
  { slug: "brakes", name: "Brakes", icon: "Disc" },
  { slug: "suspension", name: "Suspension", icon: "MoveVertical" },
  { slug: "electrical", name: "Electrical & Lighting", icon: "Zap" },
  { slug: "filters", name: "Filters & Oils", icon: "Droplet" },
  { slug: "motorbike", name: "Motorbike Parts", icon: "Bike" },
  { slug: "accessories", name: "Accessories", icon: "Sparkles" },
  { slug: "tyres", name: "Tyres & Wheels", icon: "CircleDot" },
];

export const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
export const ksh = (n: number) => "KSh " + n.toLocaleString("en-KE");
export const fallbackImage = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=600&fit=crop";
