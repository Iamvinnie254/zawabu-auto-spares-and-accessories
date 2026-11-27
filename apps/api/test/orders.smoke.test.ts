import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import request from "supertest";
import { eq } from "drizzle-orm";

import { AppModule } from "../src/app.module";
import { DRIZZLE } from "../src/db/db.module";
import { orders, products, stockMovements, type Database } from "../src/db/schema";

let app: INestApplication;
let superToken: string;
let productId: string;
let orderId: string;
const sku = `ORDER-TEST-${Date.now()}`;
const phone = "0712345678";

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.setGlobalPrefix("api");
  await app.init();

  const login = await request(app.getHttpServer())
    .post("/api/auth/login")
    .send({
      email: "superadmin@zawabu.co.ke",
      password: "ChangeMe!SuperAdmin2026",
    })
    .expect(201);

  superToken = login.body.accessToken;

  const product = await request(app.getHttpServer())
    .post("/api/products")
    .set("Authorization", `Bearer ${superToken}`)
    .send({
      name: "Order Smoke Test Filter",
      sku,
      category: "filters",
      vehicle: "Car",
      condition: "Aftermarket",
      price: 1500,
      stock: 5,
    })
    .expect(201);

  productId = product.body.id;
});

afterAll(async () => {
  if (!app) {
    return;
  }
  const db = app.get<Database>(DRIZZLE);
  if (orderId) {
    await db.delete(orders).where(eq(orders.id, orderId));
  }
  if (productId) {
    await db.delete(stockMovements).where(eq(stockMovements.productId, productId));
    await db.delete(products).where(eq(products.id, productId));
  }
  await app.close();
});

describe("Orders and payments API smoke", () => {
  test("creates an order, reserves stock and supports tracking", async () => {
    await request(app.getHttpServer()).get("/api/orders").expect(401);

    const created = await request(app.getHttpServer())
      .post("/api/orders")
      .send({
        customer: "Smoke Customer",
        phone,
        location: "Nairobi",
        delivery: "Delivery",
        payment: "M-Pesa",
        items: [{ productId, qty: 2 }],
      })
      .expect(201);

    orderId = created.body.id;
    expect(created.body.orderNumber).toMatch(/^ZW-\d+$/);
    expect(created.body.total).toBe(3300);
    expect(created.body.items).toHaveLength(1);

    const afterOrder = await request(app.getHttpServer())
      .get(`/api/products/${productId}`)
      .expect(200);
    expect(afterOrder.body.stock).toBe(3);

    await request(app.getHttpServer())
      .get(`/api/orders/track?orderNumber=${created.body.orderNumber}&phone=0711111111`)
      .expect(404);

    const tracked = await request(app.getHttpServer())
      .get(`/api/orders/track?orderNumber=${created.body.orderNumber}&phone=${phone}`)
      .expect(200);
    expect(tracked.body.id).toBe(orderId);
  });

  test("M-Pesa stub records payment and callback confirms the order", async () => {
    const stk = await request(app.getHttpServer())
      .post("/api/payments/mpesa/stk")
      .send({ orderId, phone })
      .expect(201);

    expect(stk.body.provider).toBe("stub");
    expect(stk.body.reference).toMatch(/^MPESA-[A-F0-9]{8}$/);

    const callback = await request(app.getHttpServer())
      .post("/api/payments/mpesa/callback")
      .send({ reference: stk.body.reference, status: "Paid" })
      .expect(201);

    expect(callback.body.paymentStatus).toBe("Paid");

    const order = await request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${superToken}`)
      .expect(200);
    expect(order.body.status).toBe("Confirmed");
  });

  test("cancelling an order restores reserved stock", async () => {
    await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ status: "Cancelled" })
      .expect(200);

    const restored = await request(app.getHttpServer())
      .get(`/api/products/${productId}`)
      .expect(200);
    expect(restored.body.stock).toBe(5);

    await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ status: "Confirmed" })
      .expect(400);
  });
});
