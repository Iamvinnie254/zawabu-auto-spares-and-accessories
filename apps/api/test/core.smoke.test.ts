import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import request from "supertest";

import { AppModule } from "../src/app.module";

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.setGlobalPrefix("api");
  await app.init();
});

afterAll(async () => {
  await app.close();
});

describe("API core smoke", () => {
  test("health reports database and redis as available", async () => {
    const response = await request(app.getHttpServer()).get("/api/health").expect(200);

    expect(response.body).toMatchObject({
      status: "ok",
      database: "ok",
      redis: "ok",
    });
  });

  test("protected routes reject anonymous requests", async () => {
    await request(app.getHttpServer()).get("/api/users").expect(401);
  });

  test("seeded super admin can log in and list users", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: "superadmin@zawabu.co.ke",
        password: "ChangeMe!SuperAdmin2026",
      })
      .expect(201);

    expect(login.body.accessToken).toBeString();
    expect(login.body.user.role).toBe("SUPER_ADMIN");

    const users = await request(app.getHttpServer())
      .get("/api/users")
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(users.body.some((user: { role: string }) => user.role === "SUPER_ADMIN")).toBe(true);
  });
});
