import "reflect-metadata";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api");

  const configuredOrigins = (
    config.get<string>("CORS_ORIGINS") ??
    config.get<string>("CORS_ORIGIN") ??
    "http://localhost:3000"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isDevelopment = config.get<string>("NODE_ENV") === "development";
  const allowedOrigins = new Set(configuredOrigins);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (
        !origin ||
        allowedOrigins.has(origin) ||
        (isDevelopment && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      ) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  });
  app.enableShutdownHooks();

  const port = config.get<number>("PORT") ?? 4000;
  await app.listen(port);
  console.log(`Zawabu API listening on http://localhost:${port}/api`);
}

void bootstrap();
