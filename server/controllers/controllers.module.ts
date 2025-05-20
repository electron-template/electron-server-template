import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ModelsModule } from '../models/models.module';
import { ViewsModule } from '../views/views.module';

@Module({
  imports: [ModelsModule, ViewsModule],
  controllers: [UserController],
  providers: [],
})
export class ControllersModule {} 