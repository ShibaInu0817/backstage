import { Module } from '@nestjs/common';
import { MessageModule } from './messages/module';
import { HttpModule } from '@boilerplate/http';
import { MonolithMessageModule } from './monolith-messages/module';
import { MessageCommandHandlerModule } from './message-command-handler/module';

@Module({
  imports: [
    HttpModule,
    MessageModule,
    MonolithMessageModule,
    MessageCommandHandlerModule,
  ],
})
export class AppModule {}
