import { Module } from '@nestjs/common';
import { CreateMessageUseCase } from './use-case';
import { CreateMessageController } from './controller';
import { MessageInfraModule } from '@boilerplate/messages-infra';

@Module({
  imports: [MessageInfraModule],
  providers: [CreateMessageUseCase],
  controllers: [CreateMessageController],
})
export class CreateMessageModule {}
