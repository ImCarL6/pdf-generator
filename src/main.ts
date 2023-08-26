import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config()

  const app = await NestFactory.create(AppModule, {cors: true});
  new ExpressAdapter()
  await app.listen(3000);
}
bootstrap();
