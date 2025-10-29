import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateMessageController } from './controller';
import { MessageInfraModule } from '@boilerplate/messages-infra';
import { CreateMessageHandler } from './handler';

@Module({
  imports: [CqrsModule, MessageInfraModule],
  providers: [CreateMessageHandler],
  controllers: [CreateMessageController],
})
export class CreateMessageModule {}
