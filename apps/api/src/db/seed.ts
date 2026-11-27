import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { products } from "./schema";

const url = process.env.DATABASE_URL ?? "postgres://zawabu:zawabu@localhost:5432/zawabu_dev";
const client = postgres(url, { max: 1 });
const db = drizzle(client);

const catalogue = [
  {
    sku: "BRK-TOY-VIOS-F",
    name: "Front Brake Pads — Toyota Vios 2008–2018",
    category: "brakes",
    vehicle: "Car" as const,
    make: "Toyota",
    model: "Vios",
    yearFrom: 2008,
    yearTo: 2018,
    engine: "1NZ-FE",
    partNumber: "04465-0D060",
    brand: "Bosch",
    condition: "OEM" as const,
    price: 3400,
    oldPrice: 3900,
    stock: 24,
    lowStockThreshold: 5,
    description: "OEM front axle brake pads with sensor, sold as an axle set.",
  },
  {
    sku: "FLT-TOY-HILUX-OIL",
    name: "Oil Filter — Toyota Hilux 2.5 D4D",
    category: "filters",
    vehicle: "Car" as const,
    make: "Toyota",
    model: "Hilux",
    yearFrom: 2005,
    yearTo: 2020,
    engine: "2KD-FTV",
    partNumber: "90915-YZZD3",
    brand: "Denso",
    condition: "Genuine" as const,
    price: 850,
    stock: 60,
    lowStockThreshold: 10,
    description: "Genuine Denso oil filter for 2.5 D4D engines.",
  },
  {
    sku: "SUS-NSN-XTRAIL-LH",
    name: "Front Lower Arm — Nissan X-Trail T30",
    category: "suspension",
    vehicle: "Car" as const,
    make: "Nissan",
    model: "X-Trail",
    yearFrom: 2001,
    yearTo: 2007,
    engine: "QR20DE",
    partNumber: "54501-8J425",
    brand: "555 Sankei",
    condition: "Aftermarket" as const,
    price: 6900,
    stock: 3,
    lowStockThreshold: 5,
    description: "Left-hand front lower control arm with bush fitted.",
  },
  {
    sku: "ELC-MBZ-C200-ALT",
    name: "Alternator — Mercedes-Benz C200 W204",
    category: "electrical",
    vehicle: "Car" as const,
    make: "Mercedes-Benz",
    model: "C-Class",
    yearFrom: 2007,
    yearTo: 2014,
    engine: "M271",
    partNumber: "A2711500060",
    brand: "Valeo",
    condition: "Ex-Japan" as const,
    price: 18500,
    stock: 2,
    lowStockThreshold: 3,
    description: "Inspected used alternator, tested before dispatch.",
  },
  {
    sku: "ENG-MTZ-BOXER-RAD",
    name: "Radiator — Mazda Boxer / B-Series",
    category: "engine",
    vehicle: "Car" as const,
    make: "Mazda",
    model: "Boxer",
    brand: "Koyo",
    condition: "Aftermarket" as const,
    price: 9800,
    stock: 8,
    lowStockThreshold: 5,
    description: "Full aluminium core radiator for petrol Boxer engines.",
  },
  {
    sku: "MOTO-BAJ-BOXER-BP",
    name: "Brake Pads — Bajaj Boxer BM100/150",
    category: "motorbike",
    vehicle: "Motorbike" as const,
    make: "Bajaj",
    model: "Boxer",
    brand: "NDK",
    condition: "Aftermarket" as const,
    price: 650,
    stock: 40,
    lowStockThreshold: 10,
    description: "Front and rear brake pad set for Bajaj Boxer models.",
  },
  {
    sku: "ACC-UNI-SEATCOVER",
    name: "Universal Seat Cover — Leatherette",
    category: "accessories",
    vehicle: "Universal" as const,
    brand: "Zawabu",
    condition: "Aftermarket" as const,
    price: 2200,
    stock: 15,
    lowStockThreshold: 5,
    description: "Water-resistant leatherette seat cover, fits most saloons.",
  },
  {
    sku: "TRE-TOY-PRADO-AT",
    name: "All-Terrain Tyre 265/65 R17 — Toyota Prado",
    category: "tyres",
    vehicle: "Car" as const,
    make: "Toyota",
    model: "Prado",
    brand: "Dunlop",
    condition: "Genuine" as const,
    price: 21500,
    stock: 12,
    lowStockThreshold: 4,
    description: "All-terrain tyre suitable for 150-series Prado and similar SUVs.",
  },
];

async function main(): Promise<void> {
  try {
    const inserted = await db
      .insert(products)
      .values(catalogue)
      .onConflictDoNothing({ target: products.sku })
      .returning({ sku: products.sku });
    console.log(`Seeded ${inserted.length} products (${catalogue.length} in catalogue)`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
