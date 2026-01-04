import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateMessageController } from './controller';
import { MessageInfraModule } from '@boilerplate/messages-infra';
import { UpdateMessageHandler } from '@boilerplate/messages-application';
import { CqrsMiddlewareModule } from '@boilerplate/application';
import { SharedAuthModule } from '@boilerplate/auth';

@Module({
  imports: [
    CqrsModule,
    CqrsMiddlewareModule,
    MessageInfraModule,
    SharedAuthModule,
  ],
  providers: [UpdateMessageHandler],
  controllers: [UpdateMessageController],
})
export class UpdateMessageModule {}
