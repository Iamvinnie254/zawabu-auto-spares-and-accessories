export type Category = { slug: string; name: string; icon: string };
export type Product = {
  id: string; name: string; category: string; vehicle: "Car" | "Motorbike" | "Universal";
  brand: string; price: number; oldPrice?: number; stock: number; description: string; img: string;
};
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
const u = (id: string) => `https://images.unsplash.com/${id}?w=600&h=600&fit=crop`;
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Brake Pads Set (Front)", category: "brakes", vehicle: "Car", brand: "Bosch", price: 3500, oldPrice: 4200, stock: 24, description: "Ceramic front brake pads for Toyota, Nissan and Mazda saloons. Low dust, quiet braking.", img: u("photo-1486262715619-67b85e0b08d3") },
  { id: "p2", name: "Engine Oil 5W-30 (4L)", category: "filters", vehicle: "Car", brand: "Total", price: 4800, stock: 40, description: "Fully synthetic engine oil for petrol and diesel engines.", img: u("photo-1635764706136-aa7ab3c0f1b1") },
  { id: "p3", name: "Oil Filter", category: "filters", vehicle: "Car", brand: "Toyota Genuine", price: 850, stock: 80, description: "Genuine oil filter fits most Toyota models.", img: u("photo-1619642751034-765dfdf7c58e") },
  { id: "p4", name: "Shock Absorber (Pair)", category: "suspension", vehicle: "Car", brand: "KYB", price: 12500, oldPrice: 14000, stock: 8, description: "Gas-filled rear shock absorbers for a smooth, stable ride.", img: u("photo-1487754180451-c456f719a1fc") },
  { id: "p5", name: "LED Headlight Bulbs H4", category: "electrical", vehicle: "Universal", brand: "Philips", price: 2900, stock: 35, description: "Bright 6000K LED bulbs, plug and play.", img: u("photo-1553440569-bcc63803a83d") },
  { id: "p6", name: "Car Battery 70Ah", category: "electrical", vehicle: "Car", brand: "Chloride Exide", price: 14500, stock: 12, description: "Maintenance-free battery with 12-month warranty.", img: u("photo-1609630875171-b1321377ee65") },
  { id: "p7", name: "Motorbike Chain & Sprocket Kit", category: "motorbike", vehicle: "Motorbike", brand: "Boxer", price: 2400, stock: 50, description: "Complete kit for Bajaj Boxer and TVS bikes.", img: u("photo-1558981806-ec527fa84c39") },
  { id: "p8", name: "Motorbike Clutch Plates", category: "motorbike", vehicle: "Motorbike", brand: "Bajaj", price: 1200, stock: 60, description: "Durable clutch plates for 100-150cc bikes.", img: u("photo-1568772585407-9361f9bf3a87") },
  { id: "p9", name: "Spark Plugs (Set of 4)", category: "engine", vehicle: "Universal", brand: "NGK", price: 1800, stock: 70, description: "Iridium spark plugs for better fuel economy.", img: u("photo-1597766353939-a8e1d0d4a5b9") },
  { id: "p10", name: "Timing Belt Kit", category: "engine", vehicle: "Car", brand: "Gates", price: 7800, stock: 10, description: "Timing belt with tensioner and idler pulley.", img: u("photo-1530046339160-ce3e530c7d2f") },
  { id: "p11", name: "Seat Covers (Full Set)", category: "accessories", vehicle: "Car", brand: "Zawabu", price: 6500, oldPrice: 8000, stock: 15, description: "Leather-look seat covers, fits most saloons and SUVs.", img: u("photo-1449965408869-eaa3f722e40d") },
  { id: "p12", name: "Motorbike Helmet", category: "accessories", vehicle: "Motorbike", brand: "Vega", price: 3200, stock: 30, description: "Full-face helmet, KEBS approved.", img: u("photo-1591637333184-19aa84b3e01f") },
  { id: "p13", name: "Alloy Rim 15\"", category: "tyres", vehicle: "Car", brand: "Enkei", price: 9500, stock: 6, description: "Lightweight 15-inch alloy rim, 4x100 PCD.", img: u("photo-1611821064430-0d40291d0f0b") },
  { id: "p14", name: "Motorbike Tyre 3.00-18", category: "tyres", vehicle: "Motorbike", brand: "Duro", price: 3800, stock: 22, description: "Rear tyre for boda boda use, strong grip.", img: u("photo-1599819811279-d5ad9cccf838") },
  { id: "p15", name: "Air Filter", category: "filters", vehicle: "Car", brand: "Mann", price: 1500, stock: 3, description: "High-flow air filter for cleaner engine intake.", img: u("photo-1625047509248-ec889cbff17f") },
  { id: "p16", name: "Dash Camera 1080p", category: "accessories", vehicle: "Universal", brand: "70mai", price: 7200, stock: 9, description: "Full HD dash cam with night vision and loop recording.", img: u("photo-1502877338535-766e1452684a") },
];
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
export const ksh = (n: number) => "KSh " + n.toLocaleString("en-KE");

export type OrderStatus = "Pending" | "Confirmed" | "Dispatched" | "Delivered" | "Cancelled";
export type Order = {
  id: string; date: string; customer: string; phone: string; email: string; location: string;
  delivery: "Pickup" | "Delivery"; payment: "M-Pesa" | "Cash on Delivery";
  items: { id: string; name: string; qty: number; price: number }[]; total: number; status: OrderStatus;
};
export type Enquiry = { id: string; date: string; name: string; phone: string; email: string; subject: string; message: string; status: "New" | "Replied" };

export const SAMPLE_ORDERS: Order[] = [
  { id: "ZW-1042", date: "2026-11-23", customer: "James Mwangi", phone: "0712 345 678", email: "james@mail.com", location: "Westlands", delivery: "Delivery", payment: "M-Pesa", items: [{ id: "p1", name: "Brake Pads Set (Front)", qty: 1, price: 3500 }, { id: "p3", name: "Oil Filter", qty: 2, price: 850 }], total: 5200, status: "Pending" },
  { id: "ZW-1041", date: "2026-11-22", customer: "Grace Achieng", phone: "0722 111 222", email: "grace@mail.com", location: "Pickup - Kirinyaga Rd", delivery: "Pickup", payment: "Cash on Delivery", items: [{ id: "p6", name: "Car Battery 70Ah", qty: 1, price: 14500 }], total: 14500, status: "Confirmed" },
  { id: "ZW-1040", date: "2026-11-21", customer: "Peter Otieno", phone: "0733 999 000", email: "peter@mail.com", location: "Kitengela", delivery: "Delivery", payment: "M-Pesa", items: [{ id: "p7", name: "Motorbike Chain & Sprocket Kit", qty: 3, price: 2400 }], total: 7200, status: "Dispatched" },
  { id: "ZW-1039", date: "2026-11-19", customer: "Mary Wanjiru", phone: "0701 222 333", email: "mary@mail.com", location: "Thika", delivery: "Delivery", payment: "M-Pesa", items: [{ id: "p11", name: "Seat Covers (Full Set)", qty: 1, price: 6500 }], total: 6500, status: "Delivered" },
];
export const SAMPLE_ENQUIRIES: Enquiry[] = [
  { id: "E-210", date: "2026-11-23", name: "Kevin Kamau", phone: "0711 000 111", email: "kevin@mail.com", subject: "Toyota Probox gearbox", message: "Do you have a used gearbox for a 2012 Probox? What's the price?", status: "New" },
  { id: "E-209", date: "2026-11-22", name: "Aisha Hassan", phone: "0798 555 444", email: "aisha@mail.com", subject: "Bulk boda boda parts", message: "I run a fleet of 20 bikes. Do you offer wholesale prices?", status: "Replied" },
];
