import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrapWorker(): Promise<void> {
  const logger = new Logger("Worker");
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });
  app.enableShutdownHooks();

  logger.log("BullMQ worker context started");
  const keepAlive = setInterval(() => undefined, 60_000);

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    logger.log(`Received ${signal}; closing worker context`);
    clearInterval(keepAlive);
    await app.close();
    process.exit(0);
  };

  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
}

void bootstrapWorker();
