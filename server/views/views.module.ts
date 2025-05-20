import { Module } from '@nestjs/common';
import { UserView } from './user.view';

@Module({
  imports: [],
  providers: [UserView],
  exports: [UserView],
})
export class ViewsModule {} 