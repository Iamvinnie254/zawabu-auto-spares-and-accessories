import "reflect-metadata";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: config.get<string>("CORS_ORIGIN") ?? "http://localhost:3000",
    credentials: true,
  });
  app.enableShutdownHooks();

  const port = config.get<number>("PORT") ?? 4000;
  await app.listen(port);
  console.log(`Zawabu API listening on http://localhost:${port}/api`);
}

void bootstrap();
