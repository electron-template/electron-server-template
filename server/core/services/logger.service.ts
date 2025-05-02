import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: string) {
    this.printLog('LOG', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.printLog('ERROR', message, context);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string) {
    this.printLog('WARN', message, context);
  }

  debug(message: string, context?: string) {
    this.printLog('DEBUG', message, context);
  }

  verbose(message: string, context?: string) {
    this.printLog('VERBOSE', message, context);
  }

  private printLog(level: string, message: string, context?: string) {
    const now = new Date();
    const timestamp = now.toISOString();
    const ctx = context ? `[${context}]` : '';
    console.log(`[${timestamp}] [${level}] ${ctx} ${message}`);
  }
} 