import { Module } from '@nestjs/common';
import { GetMessageModule } from './get/module';
import { CreateMessageModule } from './create/module';
import { ListMessagesModule } from './list/module';

@Module({
  imports: [GetMessageModule, CreateMessageModule, ListMessagesModule],
})
export class MonolithMessageModule {}
