import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetMessageController } from './controller';
import { MessageInfraModule } from '@boilerplate/messages-infra';
import { GetMessageHandler } from '@boilerplate/messages-application';
import { CqrsMiddlewareModule } from '@boilerplate/application';

@Module({
  imports: [CqrsModule, CqrsMiddlewareModule, MessageInfraModule],
  providers: [GetMessageHandler],
  controllers: [GetMessageController],
})
export class GetMessageModule {}
