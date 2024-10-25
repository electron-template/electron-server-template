import { Module } from '@nestjs/common';
import modules from './modules/modules';
@Module({
  imports: [...modules],
  controllers: [],
  providers: [],
})
export class AppModule {}
