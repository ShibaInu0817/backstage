import { Controller, Post } from '@nestjs/common';
import { CreateMessageUseCase } from './use-case';

@Controller({ path: 'message', version: ['1'] })
export class CreateMessageController {
  constructor(private readonly createMessageUseCase: CreateMessageUseCase) {}

  @Post()
  getData() {
    return this.createMessageUseCase.execute({
      content: 'Hello, world!',
      senderId: '1',
      tenantId: '1',
      conversationId: '1',
    });
  }
}
