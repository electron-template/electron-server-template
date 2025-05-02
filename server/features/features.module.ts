import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    UserModule,
    ApiModule
  ],
})
export class FeaturesModule {} 