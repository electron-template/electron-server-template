import { Module } from '@nestjs/common';
import { UserModel } from './user.model';

@Module({
  imports: [],
  providers: [UserModel],
  exports: [UserModel],
})
export class ModelsModule {} 