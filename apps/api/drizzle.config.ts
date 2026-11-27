import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://zawabu:zawabu@localhost:5432/zawabu_dev",
  },
  strict: true,
  verbose: true,
});
