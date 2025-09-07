import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageRepository } from './repositories/message/repository';
import { MessageDo, MessageSchema } from './repositories/message/schema';
import { SampleTemplateMongodbModule } from '@boilerplate/infra';
// Dependency Injection Token for Repository Interface
export const MESSAGE_REPOSITORY_TOKEN = 'IMessageRepository';

@Module({
  imports: [
    SampleTemplateMongodbModule,
    MongooseModule.forFeature([
      { name: MessageDo.name, schema: MessageSchema },
    ]),
  ],
  providers: [
    {
      provide: MESSAGE_REPOSITORY_TOKEN,
      useClass: MessageRepository,
    },
  ],
  exports: [MESSAGE_REPOSITORY_TOKEN],
})
export class MessageInfraModule {}
