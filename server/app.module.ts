import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ModelsModule } from './models/models.module';
import { ControllersModule } from './controllers/controllers.module';
import { ViewsModule } from './views/views.module';

@Module({
  imports: [
    // 配置模块，用于管理应用配置
    ConfigModule,
    // 核心模块，包含基本服务和拦截器
    CoreModule,
    // 共享模块，提供公共服务和组件
    SharedModule,
    // MVC架构模块
    ModelsModule,
    ViewsModule,
    ControllersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
