import { Module } from '@nestjs/common';
import { HttpService } from './services/http.service';
import { UtilsService } from './services/utils.service';

@Module({
  providers: [
    HttpService,
    UtilsService
  ],
  exports: [
    HttpService,
    UtilsService
  ],
})
export class SharedModule {} 