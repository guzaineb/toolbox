// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // Chemin absolu vers le dossier uploads
  const uploadsPath = join(process.cwd(), 'uploads');
  
  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Dossier uploads créé:', uploadsPath);
  }
  
  // Servir les fichiers statiques
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });
  
  console.log(`📁 Serving static files from: ${uploadsPath}`);
  console.log(`🌐 Access files at: http://localhost:${process.env.PORT ?? 3000}/uploads/`);
  
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();