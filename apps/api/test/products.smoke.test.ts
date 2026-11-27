import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import request from "supertest";

import { AppModule } from "../src/app.module";

let app: INestApplication;
let superToken: string;
const sku = `TEST-SKU-${Date.now()}`;
let productId: string;
let salesUserId: string;

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
});

afterAll(async () => {
  if (productId && superToken) {
    await request(app.getHttpServer())
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${superToken}`);
  }
  if (salesUserId && superToken) {
    await request(app.getHttpServer())
      .delete(`/api/users/${salesUserId}`)
      .set("Authorization", `Bearer ${superToken}`);
  }
  await app.close();
});

describe("Products API smoke", () => {
  test("public catalogue returns seeded products and supports filters", async () => {
    const all = await request(app.getHttpServer()).get("/api/products").expect(200);

    expect(all.body.length).toBeGreaterThan(0);

    const filtered = await request(app.getHttpServer())
      .get("/api/products?category=brakes")
      .expect(200);

    expect(
      filtered.body.every((product: { category: string }) => product.category === "brakes"),
    ).toBe(true);
  });

  test("staff can create and update products and cache is invalidated", async () => {
    const created = await request(app.getHttpServer())
      .post("/api/products")
      .set("Authorization", `Bearer ${superToken}`)
      .send({
        name: "Smoke Test Brake Pad",
        sku,
        category: "brakes",
        vehicle: "Car",
        condition: "Aftermarket",
        price: 1200,
        stock: 4,
      })
      .expect(201);

    productId = created.body.id;
    expect(created.body.stock).toBe(4);

    await request(app.getHttpServer()).get(`/api/products/${productId}`).expect(200);

    const updated = await request(app.getHttpServer())
      .patch(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${superToken}`)
      .send({ stock: 9 })
      .expect(200);

    expect(updated.body.stock).toBe(9);

    const refreshed = await request(app.getHttpServer())
      .get(`/api/products/${productId}`)
      .expect(200);

    expect(refreshed.body.stock).toBe(9);
  });

  test("sales person can edit stock but cannot manage users", async () => {
    const email = `sales.${Date.now()}@example.com`;
    const password = "SalesPerson!2026";

    const createdUser = await request(app.getHttpServer())
      .post("/api/users")
      .set("Authorization", `Bearer ${superToken}`)
      .send({ name: "Smoke Sales", email, password, role: "SALES_PERSON" })
      .expect(201);

    salesUserId = createdUser.body.id;

    const login = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email, password })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .send({ stock: 10 })
      .expect(200);

    await request(app.getHttpServer())
      .get("/api/users")
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .expect(403);
  });
});
