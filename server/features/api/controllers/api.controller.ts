import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiService } from '../services/api.service';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('status')
  getStatus() {
    return this.apiService.getStatus();
  }

  @Get('info')
  getInfo() {
    return this.apiService.getAppInfo();
  }

  @Post('message')
  sendMessage(@Body() data: any) {
    return this.apiService.processMessage(data);
  }
} 