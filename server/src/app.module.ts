import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // 配置模块，使用.env文件配置环境变量
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 业务功能模块
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 