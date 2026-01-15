import { Module } from '@nestjs/common';
import { GetMessageUseCase } from './use-case';
import { GetMessageController } from './controller';
import { MessageInfraModule } from '@boilerplate/messages-infra';

@Module({
  imports: [MessageInfraModule],
  providers: [GetMessageUseCase],
  controllers: [GetMessageController],
})
export class GetMessageModule {}
