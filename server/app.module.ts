import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { FeaturesModule } from './features/features.module';
import { SharedModule } from './shared/shared.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    // 配置模块，用于管理应用配置
    ConfigModule,
    // 核心模块，包含基本服务和拦截器
    CoreModule,
    // 共享模块，提供公共服务和组件
    SharedModule,
    // 功能模块，包含所有业务逻辑
    FeaturesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
