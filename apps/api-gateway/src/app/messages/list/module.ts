import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListMessagesController } from './controller';
import { MessageInfraModule } from '@boilerplate/messages-infra';
import { ListMessagesHandler } from '@boilerplate/messages-application';
import { CqrsMiddlewareModule } from '@boilerplate/application';

@Module({
  imports: [CqrsModule, CqrsMiddlewareModule, MessageInfraModule],
  providers: [ListMessagesHandler],
  controllers: [ListMessagesController],
})
export class ListMessagesModule {}
