import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MessageInfraModule } from '@boilerplate/messages-infra';
import { CreateMessageHandler } from '@boilerplate/messages-application';

@Module({
  imports: [CqrsModule, MessageInfraModule],
  providers: [CreateMessageHandler],
})
export class CreateMessageCommandHandlerModule {}
