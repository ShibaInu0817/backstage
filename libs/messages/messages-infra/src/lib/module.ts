import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageRepository } from './repositories/message/repository';
import { MessageDo, MessageSchema } from './repositories/message/schema';
import { SampleTemplateMongodbModule } from '@boilerplate/infra';
import { MESSAGE_REPOSITORY_TOKEN } from '@boilerplate/messages-domain';

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
