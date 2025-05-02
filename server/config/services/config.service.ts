import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    this.envConfig = {
      PORT: process.env.PORT || '3000',
      NODE_ENV: process.env.NODE_ENV || 'development',
      APP_NAME: 'Electron Server Template',
      APP_VERSION: '1.0.0',
    };
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  getPort(): number {
    return parseInt(this.get('PORT'), 10);
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }
} 