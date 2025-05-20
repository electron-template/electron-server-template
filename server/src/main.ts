import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 全局管道 - 用于验证请求数据
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // 启用CORS
  app.enableCors();
  
  // 应用前缀
  app.setGlobalPrefix('api');
  
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap(); 