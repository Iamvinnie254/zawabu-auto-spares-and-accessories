import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { hash } from "bcryptjs";
import postgres from "postgres";
import type { DeliveryMethod, OrderStatus, PaymentMethod, PaymentStatus } from "@zawabu/shared";

import { enquiries, orderItems, orders, products, stockMovements, users } from "./schema";

const url = process.env.DATABASE_URL ?? "postgres://zawabu:zawabu@localhost:5432/zawabu_dev";
const client = postgres(url, { max: 1 });
const db = drizzle(client);

type ProductSeed = typeof products.$inferInsert;
type EnquirySeed = typeof enquiries.$inferInsert;

type OrderItemSeed = {
  sku: string;
  qty: number;
};

type OrderSeed = {
  reference: string;
  customer: string;
  phone: string;
  email: string;
  location: string;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  deliveryFee: number;
  notes: string;
  createdAt: Date;
  items: OrderItemSeed[];
};

const catalogue: ProductSeed[] = [
  {
    sku: "BRK-TOY-VIOS-F",
    name: "Front Brake Pads — Toyota Vios 2008–2018",
    category: "brakes",
    vehicle: "Car",
    make: "Toyota",
    model: "Vios",
    yearFrom: 2008,
    yearTo: 2018,
    engine: "1NZ-FE",
    partNumber: "04465-0D060",
    brand: "Bosch",
    condition: "OEM",
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
    vehicle: "Car",
    make: "Toyota",
    model: "Hilux",
    yearFrom: 2005,
    yearTo: 2020,
    engine: "2KD-FTV",
    partNumber: "90915-YZZD3",
    brand: "Denso",
    condition: "Genuine",
    price: 850,
    stock: 60,
    lowStockThreshold: 10,
    description: "Genuine Denso oil filter for 2.5 D4D engines.",
  },
  {
    sku: "SUS-NSN-XTRAIL-LH",
    name: "Front Lower Arm — Nissan X-Trail T30",
    category: "suspension",
    vehicle: "Car",
    make: "Nissan",
    model: "X-Trail",
    yearFrom: 2001,
    yearTo: 2007,
    engine: "QR20DE",
    partNumber: "54501-8J425",
    brand: "555 Sankei",
    condition: "Aftermarket",
    price: 6900,
    stock: 3,
    lowStockThreshold: 5,
    description: "Left-hand front lower control arm with bush fitted.",
  },
  {
    sku: "ELC-MBZ-C200-ALT",
    name: "Alternator — Mercedes-Benz C200 W204",
    category: "electrical",
    vehicle: "Car",
    make: "Mercedes-Benz",
    model: "C-Class",
    yearFrom: 2007,
    yearTo: 2014,
    engine: "M271",
    partNumber: "A2711500060",
    brand: "Valeo",
    condition: "Ex-Japan",
    price: 18500,
    stock: 2,
    lowStockThreshold: 3,
    description: "Inspected used alternator, tested before dispatch.",
  },
  {
    sku: "ENG-MTZ-BOXER-RAD",
    name: "Radiator — Mazda Boxer / B-Series",
    category: "engine",
    vehicle: "Car",
    make: "Mazda",
    model: "Boxer",
    brand: "Koyo",
    condition: "Aftermarket",
    price: 9800,
    stock: 8,
    lowStockThreshold: 5,
    description: "Full aluminium core radiator for petrol Boxer engines.",
  },
  {
    sku: "MOTO-BAJ-BOXER-BP",
    name: "Brake Pads — Bajaj Boxer BM100/150",
    category: "motorbike",
    vehicle: "Motorbike",
    make: "Bajaj",
    model: "Boxer",
    brand: "NDK",
    condition: "Aftermarket",
    price: 650,
    stock: 40,
    lowStockThreshold: 10,
    description: "Front and rear brake pad set for Bajaj Boxer models.",
  },
  {
    sku: "ACC-UNI-SEATCOVER",
    name: "Universal Seat Cover — Leatherette",
    category: "accessories",
    vehicle: "Universal",
    brand: "Zawabu",
    condition: "Aftermarket",
    price: 2200,
    stock: 15,
    lowStockThreshold: 5,
    description: "Water-resistant leatherette seat cover, fits most saloons.",
  },
  {
    sku: "TRE-TOY-PRADO-AT",
    name: "All-Terrain Tyre 265/65 R17 — Toyota Prado",
    category: "tyres",
    vehicle: "Car",
    make: "Toyota",
    model: "Prado",
    brand: "Dunlop",
    condition: "Genuine",
    price: 21500,
    stock: 12,
    lowStockThreshold: 4,
    description: "All-terrain tyre suitable for 150-series Prado and similar SUVs.",
  },
  {
    sku: "ELC-TOY-VIOS-PLUG",
    name: "Iridium Spark Plugs (Set of 4) — Toyota Vios 1NZ-FE",
    category: "electrical",
    vehicle: "Car",
    make: "Toyota",
    model: "Vios",
    yearFrom: 2008,
    yearTo: 2018,
    engine: "1NZ-FE",
    partNumber: "BKR6EIX-11",
    brand: "NGK",
    condition: "Genuine",
    price: 1450,
    oldPrice: 1700,
    stock: 18,
    lowStockThreshold: 6,
    description: "Genuine NGK iridium plugs, sold as a set of four.",
  },
  {
    sku: "FLT-NSN-XTRAIL-AIR",
    name: "Air Filter — Nissan X-Trail T30",
    category: "filters",
    vehicle: "Car",
    make: "Nissan",
    model: "X-Trail",
    yearFrom: 2001,
    yearTo: 2007,
    engine: "QR20DE",
    partNumber: "16546-4M410",
    brand: "Denso",
    condition: "OEM",
    price: 1250,
    stock: 12,
    lowStockThreshold: 4,
    description: "High-flow paper air filter for QR20DE engines.",
  },
  {
    sku: "SUS-TOY-HILUX-SHOCK",
    name: "Front Shock Absorber — Toyota Hilux 4x4",
    category: "suspension",
    vehicle: "Car",
    make: "Toyota",
    model: "Hilux",
    yearFrom: 2005,
    yearTo: 2015,
    partNumber: "48511-0K010",
    brand: "Tokico",
    condition: "Genuine",
    price: 7800,
    stock: 5,
    lowStockThreshold: 5,
    description: "Gas-charged front shock absorber for lifted Hilux 4x4 models.",
  },
  {
    sku: "ENG-MBZ-C200-PUMP",
    name: "Water Pump — Mercedes-Benz C200 W204",
    category: "engine",
    vehicle: "Car",
    make: "Mercedes-Benz",
    model: "C-Class",
    yearFrom: 2007,
    yearTo: 2014,
    engine: "M271",
    partNumber: "A2712000501",
    brand: "Hepu",
    condition: "OEM",
    price: 9400,
    stock: 4,
    lowStockThreshold: 3,
    description: "Cast-iron water pump with gasket for M271 engines.",
  },
  {
    sku: "MOTO-BAJ-BOXER-SHOE",
    name: "Rear Brake Shoes — Bajaj Boxer BM150",
    category: "motorbike",
    vehicle: "Motorbike",
    make: "Bajaj",
    model: "Boxer",
    partNumber: "BK-BX150-RS",
    brand: "NDK",
    condition: "Aftermarket",
    price: 720,
    stock: 30,
    lowStockThreshold: 8,
    description: "Rear brake shoe set with Springs and retaining kit.",
  },
  {
    sku: "ELC-UNI-BATTERY-65AH",
    name: "Car Battery 12V 65Ah — Toyota Prado / SUV",
    category: "electrical",
    vehicle: "Universal",
    brand: "Exide",
    partNumber: "NS60LS",
    condition: "Genuine",
    price: 13500,
    oldPrice: 14500,
    stock: 7,
    lowStockThreshold: 4,
    description: "Maintenance-free battery with 12-month warranty.",
  },
  {
    sku: "ACC-UNI-WIPER-2119",
    name: 'Wiper Blades Pair 21"/19" — Universal Fit',
    category: "accessories",
    vehicle: "Universal",
    partNumber: "WB-2119",
    brand: "Bosch",
    condition: "Aftermarket",
    price: 1100,
    stock: 45,
    lowStockThreshold: 10,
    description: "Beam-style wiper blades with universal J-hook adapters.",
  },
  {
    sku: "ELC-TOY-VIOS-LOCK",
    name: "Door Lock Actuator — Toyota Vios 2008–2013",
    category: "electrical",
    vehicle: "Car",
    make: "Toyota",
    model: "Vios",
    yearFrom: 2008,
    yearTo: 2013,
    partNumber: "69030-0D030",
    brand: "Denso",
    condition: "OEM",
    price: 4600,
    stock: 0,
    lowStockThreshold: 3,
    description: "Front left door lock actuator, currently awaiting restock.",
  },
];

const staff = [
  { name: "Mercy Wanjiku", email: "mercy.wanjiku@zawabu.co.ke", role: "SALES_MANAGER" as const },
  { name: "Kevin Mutua", email: "kevin.mutua@zawabu.co.ke", role: "SALES_PERSON" as const },
];

const orderSeeds: OrderSeed[] = [
  {
    reference: "SEED-MPESA-1001",
    customer: "Brian Otieno",
    phone: "0712345678",
    email: "brian.otieno@example.com",
    location: "Kilifi Town",
    delivery: "Delivery",
    payment: "M-Pesa",
    paymentStatus: "Paid",
    status: "Dispatched",
    deliveryFee: 300,
    notes: "Deliver after 5pm; call on arrival.",
    createdAt: new Date("2026-11-22T09:30:00Z"),
    items: [
      { sku: "BRK-TOY-VIOS-F", qty: 1 },
      { sku: "FLT-TOY-HILUX-OIL", qty: 2 },
    ],
  },
  {
    reference: "SEED-COD-1002",
    customer: "Faith Mwangi",
    phone: "0722987654",
    email: "faith.mwangi@example.com",
    location: "Mombasa CBD",
    delivery: "Pickup",
    payment: "Cash on Delivery",
    paymentStatus: "Unpaid",
    status: "Pending",
    deliveryFee: 0,
    notes: "Customer will collect from the shop tomorrow morning.",
    createdAt: new Date("2026-11-23T11:15:00Z"),
    items: [
      { sku: "SUS-NSN-XTRAIL-LH", qty: 1 },
      { sku: "FLT-NSN-XTRAIL-AIR", qty: 1 },
    ],
  },
  {
    reference: "SEED-BANK-1003",
    customer: "Samuel Kiptoo",
    phone: "0705123456",
    email: "samuel.kiptoo@example.com",
    location: "Nakuru",
    delivery: "Delivery",
    payment: "Bank Transfer",
    paymentStatus: "Paid",
    status: "Delivered",
    deliveryFee: 500,
    notes: "Invoice sent to customer email.",
    createdAt: new Date("2026-11-24T14:45:00Z"),
    items: [
      { sku: "ELC-MBZ-C200-ALT", qty: 1 },
      { sku: "ELC-UNI-BATTERY-65AH", qty: 1 },
    ],
  },
  {
    reference: "SEED-MPESA-1004",
    customer: "Amina Hassan",
    phone: "0755123456",
    email: "amina.hassan@example.com",
    location: "Malindi",
    delivery: "Delivery",
    payment: "M-Pesa",
    paymentStatus: "Pending",
    status: "Confirmed",
    deliveryFee: 600,
    notes: "Two tyres needed for fleet vehicle; confirm tread depth before dispatch.",
    createdAt: new Date("2026-11-25T08:20:00Z"),
    items: [
      { sku: "TRE-TOY-PRADO-AT", qty: 2 },
      { sku: "ACC-UNI-WIPER-2119", qty: 1 },
    ],
  },
  {
    reference: "SEED-COD-1005",
    customer: "Dennis Onyango",
    phone: "0733123456",
    email: "dennis.onyango@example.com",
    location: "Kisumu",
    delivery: "Pickup",
    payment: "Cash on Delivery",
    paymentStatus: "Unpaid",
    status: "Cancelled",
    deliveryFee: 0,
    notes: "Customer changed vehicle model; order cancelled.",
    createdAt: new Date("2026-11-26T16:05:00Z"),
    items: [{ sku: "ACC-UNI-SEATCOVER", qty: 1 }],
  },
];

const enquirySeeds: EnquirySeed[] = [
  {
    name: "Jane Wambui",
    phone: "0711222333",
    email: "jane.wambui@example.com",
    subject: "Genuine front brake pads for Vios 2015",
    message:
      "Do you have genuine front brake pads for a 2015 Toyota Vios, and how long is delivery to Nyeri?",
    status: "Replied",
    createdAt: new Date("2026-11-20T10:10:00Z"),
  },
  {
    name: "Peter Kamau",
    phone: "0722333444",
    email: "peter.kamau@example.com",
    subject: "Delivery to Malindi",
    message:
      "I need an oil filter and spark plugs delivered to Malindi. Do you deliver there and what is the lead time?",
    status: "New",
    createdAt: new Date("2026-11-24T13:40:00Z"),
  },
  {
    name: "Lydia Achieng",
    phone: "0733444555",
    email: "lydia.achieng@example.com",
    subject: "Fleet service quotation",
    message:
      "Please send a quotation for servicing six Toyota Hilux vehicles: oil filters, air filters and brake pads.",
    status: "Replied",
    createdAt: new Date("2026-11-25T09:05:00Z"),
  },
  {
    name: "Omar Ali",
    phone: "0744555666",
    email: "omar.ali@example.com",
    subject: "Bajaj Boxer rear shock availability",
    message:
      "Is the rear shock absorber for Bajaj Boxer BM150 available? I need two units this week.",
    status: "New",
    createdAt: new Date("2026-11-26T15:25:00Z"),
  },
];

async function main(): Promise<void> {
  try {
    const insertedProducts = await db
      .insert(products)
      .values(catalogue)
      .onConflictDoNothing({ target: products.sku })
      .returning({ sku: products.sku });

    const catalogueRows = await db
      .select({ id: products.id, sku: products.sku, name: products.name, price: products.price })
      .from(products);
    const productBySku = new Map(catalogueRows.map((product) => [product.sku, product]));

    const passwordHash = await hash(process.env.SEED_USER_PASSWORD ?? "DemoPass123!", 10);
    let staffInserted = 0;
    for (const member of staff) {
      const inserted = await db
        .insert(users)
        .values({ ...member, passwordHash })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id });
      staffInserted += inserted.length;
    }

    let ordersInserted = 0;
    let orderItemsInserted = 0;
    let stockMovementsInserted = 0;

    for (const seed of orderSeeds) {
      const lineItems = seed.items.map(({ sku, qty }) => {
        const product = productBySku.get(sku);
        if (!product) {
          throw new Error(`Seed product ${sku} was not found`);
        }
        const lineTotal = product.price * qty;
        return {
          productId: product.id,
          name: product.name,
          sku,
          qty,
          unitPrice: product.price,
          lineTotal,
        };
      });

      const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const insertedOrders = await db
        .insert(orders)
        .values({
          customer: seed.customer,
          phone: seed.phone,
          email: seed.email,
          location: seed.location,
          delivery: seed.delivery,
          payment: seed.payment,
          paymentStatus: seed.paymentStatus,
          paymentReference: seed.reference,
          status: seed.status,
          subtotal,
          deliveryFee: seed.deliveryFee,
          total: subtotal + seed.deliveryFee,
          notes: seed.notes,
          createdAt: seed.createdAt,
        })
        .onConflictDoNothing({ target: orders.paymentReference })
        .returning({ id: orders.id, orderNumber: orders.orderNumber });

      const order =
        insertedOrders[0] ??
        (
          await db
            .select({ id: orders.id, orderNumber: orders.orderNumber })
            .from(orders)
            .where(eq(orders.paymentReference, seed.reference))
            .limit(1)
        )[0];

      if (!order) {
        throw new Error(`Seed order ${seed.reference} could not be resolved`);
      }

      ordersInserted += insertedOrders.length;

      const existingItems = await db
        .select({ id: orderItems.id })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id))
        .limit(1);

      if (existingItems.length === 0) {
        const insertedItems = await db
          .insert(orderItems)
          .values(lineItems.map((item) => ({ ...item, orderId: order.id })))
          .returning({ id: orderItems.id });
        orderItemsInserted += insertedItems.length;
      }

      if (seed.status === "Dispatched" || seed.status === "Delivered") {
        for (const item of lineItems) {
          const reason = `Seed dispatch ${order.orderNumber}`;
          const existingMovement = await db
            .select({ id: stockMovements.id })
            .from(stockMovements)
            .where(
              and(
                eq(stockMovements.orderId, order.id),
                eq(stockMovements.productId, item.productId),
                eq(stockMovements.reason, reason),
              ),
            )
            .limit(1);

          if (existingMovement.length === 0) {
            await db.insert(stockMovements).values({
              productId: item.productId,
              orderId: order.id,
              delta: -item.qty,
              reason,
              createdAt: seed.createdAt,
            });
            stockMovementsInserted += 1;
          }
        }
      }
    }

    let enquiriesInserted = 0;
    for (const seed of enquirySeeds) {
      const existing = await db
        .select({ id: enquiries.id })
        .from(enquiries)
        .where(
          and(
            eq(enquiries.name, seed.name),
            eq(enquiries.phone, seed.phone),
            eq(enquiries.subject, seed.subject),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(enquiries).values(seed);
        enquiriesInserted += 1;
      }
    }

    console.log(`Seeded ${insertedProducts.length} products (${catalogue.length} in catalogue)`);
    console.log(`Seeded ${staffInserted} staff users`);
    console.log(
      `Seeded ${ordersInserted} orders, ${orderItemsInserted} order items, ${stockMovementsInserted} stock movements`,
    );
    console.log(`Seeded ${enquiriesInserted} enquiries`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
