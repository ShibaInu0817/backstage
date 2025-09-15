import { Module } from '@nestjs/common';
import { MessageModule } from './messages/module';

@Module({
  imports: [MessageModule],
})
export class AppModule {}
