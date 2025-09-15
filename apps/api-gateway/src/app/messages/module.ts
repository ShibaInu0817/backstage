import { Module } from '@nestjs/common';
import { GetMessageModule } from './get/module';
import { CreateMessageModule } from './create/module';

@Module({
  imports: [GetMessageModule, CreateMessageModule],
})
export class MessageModule {}
