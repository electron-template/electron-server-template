import { join } from 'path';
import { app } from 'electron';
import { NestFactory } from '@nestjs/core';

createServer()
export default async function createServer() {
  let serverPath;
  if (process.env.NODE_ENV === 'development') {
    serverPath = join(__dirname, '../../server','/app.module');
  } else {
    serverPath = join(app.getAppPath(), '/server', '/app.module');
  }
  const { AppModule } = await import(serverPath);
  // const AppModule= {}
  const nestApp = await NestFactory.create(AppModule);
  nestApp.enableCors()
  await nestApp.listen(process.env.PORT ?? 3000);
  return async () => {
    await nestApp.close();
  };
}