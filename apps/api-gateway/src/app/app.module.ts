import { Module } from '@nestjs/common';
import { MessageModule } from './messages/module';
import { HttpModule } from '@boilerplate/http';

@Module({
  imports: [HttpModule, MessageModule],
})
export class AppModule {}
