// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join, resolve } from 'path';
import * as fs from 'fs';
import 'reflect-metadata';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableShutdownHooks();

  // Chemin absolu vers le dossier uploads (volume Docker en production)
  const uploadsPath = process.env.UPLOADS_DIR
    ? resolve(process.env.UPLOADS_DIR)
    : join(process.cwd(), 'uploads');

  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Dossier uploads créé:', uploadsPath);
  }
  // Servir les fichiers statiques
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  const port = parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  console.log(`📁 Serving static files from: ${uploadsPath}`);

  const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port, host);
  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log(`🌐 Access files at: http://${host}:${port}/uploads/`);
}
void bootstrap();
