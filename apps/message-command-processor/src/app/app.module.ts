import { Module } from '@nestjs/common';
import { HttpModule } from '@boilerplate/http';
import { MessageCommandHandlerModule } from './message-command-handler/module';

@Module({
  imports: [HttpModule, MessageCommandHandlerModule],
})
export class AppModule {}
