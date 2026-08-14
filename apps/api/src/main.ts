import "reflect-metadata";

import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "express";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./shared/filters/all-exceptions.filter";
import { RequestLoggingInterceptor } from "./shared/interceptors/request-logging.interceptor";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = new Logger("Bootstrap");
  const config = app.get(ConfigService);
  const corsOrigins = config
    .getOrThrow<string>("CORS_ORIGIN")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestBodyLimit = config.get<string>("REQUEST_BODY_LIMIT", "1mb");

  app.use(json({ limit: requestBodyLimit }));
  app.use(urlencoded({ extended: true, limit: requestBodyLimit }));
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
  );
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new RequestLoggingInterceptor());
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Vriddhi Nexus Bus API")
    .setDescription(
      "OpenAPI contract for the Vriddhi Nexus bus booking platform, including production health probes, maintenance controls, Redis caching, BullMQ queues, mock supplier adapters, mock payment adapters, monitoring, metrics, observability, and launch-readiness APIs.",
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = config.getOrThrow<number>("API_PORT");
  await app.listen(port);
  logger.log(`API listening on port ${port}`);
}

void bootstrap();
