import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  // Parse JSON bodies for all requests
  app.use(bodyParser.json({ limit: '10mb' }));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    forbidUnknownValues: false,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    skipMissingProperties: true,
  }));
  app.useStaticAssets('uploads', { 
    prefix: '/uploads/',
    setHeaders: (res, path) => {
      if (path.endsWith('.pdf')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
      }
    }
  });
  
  const config = new DocumentBuilder()
    .setTitle('Daily Kurtis API')
    .setDescription('Authentication API for users and admins')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();