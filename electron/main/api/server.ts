import { join } from 'path';
import { app } from 'electron';
import { NestFactory } from '@nestjs/core';
import { ServerStopHandler } from '../modules/types';
import * as fs from 'fs';

/**
 * 创建并启动 NestJS 服务
 * @returns 停止服务器的处理函数
 */
export default async function createServer(): Promise<ServerStopHandler> {
  let serverPath;
  
  if (process.env.NODE_ENV === 'development') {
    serverPath = join(__dirname, '../../../server', '/app.module');
  } else {
    // 尝试从package.json读取serverModulePath配置
    try {
      const packageJsonPath = join(app.getAppPath(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.serverModulePath) {
        serverPath = join(app.getAppPath(), packageJson.serverModulePath);
      } else {
        serverPath = join(app.getAppPath(), 'build/server', '/app.module');
      }
    } catch (error) {
      console.warn('读取package.json失败，使用默认server路径');
      serverPath = join(app.getAppPath(), 'build/server', '/app.module');
    }
  }

  try {
    console.log(`尝试加载服务器模块: ${serverPath}`);
    
    // 动态导入应用模块
    const { AppModule } = await import(serverPath);

    // 创建 NestJS 应用实例
    const nestApp = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'], // 生产环境下减少日志输出
    });

    // 启用 CORS
    nestApp.enableCors({
      origin: process.env.NODE_ENV === 'development' ? '*' : false,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    });

    // 设置全局前缀 (可选)
    // nestApp.setGlobalPrefix('api');

    // 获取服务端口
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    // 启动服务
    await nestApp.listen(port);

    console.log(`NestJS 服务已启动，监听端口: ${port}`);

    // 返回一个函数用于关闭服务
    return async () => {
      console.log('正在关闭 NestJS 服务...');
      await nestApp.close();
      console.log('NestJS 服务已关闭');
    };
  } catch (error) {
    console.error('启动 NestJS 服务失败:', error);
    throw error;
  }
}
