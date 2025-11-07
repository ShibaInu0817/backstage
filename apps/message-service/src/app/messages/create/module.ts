import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateMessageController } from './controller';
import { MessageInfraModule } from '@boilerplate/messages-infra';
import { CreateMessageHandler } from '@boilerplate/messages-application';
import { CqrsMiddlewareModule } from '@boilerplate/application';

@Module({
  imports: [CqrsModule, CqrsMiddlewareModule, MessageInfraModule],
  providers: [CreateMessageHandler],
  controllers: [CreateMessageController],
})
export class CreateMessageModule {}
