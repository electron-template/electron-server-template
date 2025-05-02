import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../config/services/config.service';

@Injectable()
export class ApiService {
  constructor(private readonly configService: ConfigService) {}

  getStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV')
    };
  }

  getAppInfo() {
    return {
      name: this.configService.get('APP_NAME'),
      version: this.configService.get('APP_VERSION'),
      environment: this.configService.isDevelopment() ? 'Development' : 'Production'
    };
  }

  processMessage(data: any) {
    return {
      received: true,
      timestamp: new Date().toISOString(),
      data
    };
  }
} 