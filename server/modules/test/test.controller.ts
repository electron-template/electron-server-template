import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {

  @Get('/demo')
  demo(): string {
    return 'Hello World!';
  }
}
