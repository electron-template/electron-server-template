import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request ${req.method} ${req.url}`);
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`Response ${res.statusCode} - ${duration}ms`);
    });

    next();
  }
} 