import { Module } from '@nestjs/common';
import { GetMessageModule } from './get/module';
import { CreateMessageModule } from './create/module';
import { ListMessagesModule } from './list/module';
import { UpdateMessageModule } from './update/module';

@Module({
  imports: [
    GetMessageModule,
    CreateMessageModule,
    ListMessagesModule,
    UpdateMessageModule,
  ],
})
export class MessageModule {}
