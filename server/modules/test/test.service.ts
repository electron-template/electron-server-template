import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  demo(): string {
    return 'Hello World!';
  }
}
