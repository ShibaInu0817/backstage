import { Module } from '@nestjs/common';
import { CreateMessageCommandHandlerModule } from './create/module';

@Module({
  imports: [CreateMessageCommandHandlerModule],
})
export class MessageCommandHandlerModule {}
