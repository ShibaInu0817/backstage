import { Module } from '@nestjs/common';
import { ListMessagesUseCase } from './use-case';
import { ListMessagesController } from './controller';
import { MessageInfraModule } from '@boilerplate/messages-infra';

@Module({
  imports: [MessageInfraModule],
  providers: [ListMessagesUseCase],
  controllers: [ListMessagesController],
})
export class ListMessagesModule {}
