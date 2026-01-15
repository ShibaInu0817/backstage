import { Module } from '@nestjs/common';
import { MessageModule } from './messages/module';
import { HttpModule } from '@boilerplate/http';
// import { MonolithMessageModule } from './monolith-messages/module';

@Module({
  imports: [HttpModule, 
    MessageModule, 
    // MonolithMessageModule
  ],
})
export class AppModule {}
