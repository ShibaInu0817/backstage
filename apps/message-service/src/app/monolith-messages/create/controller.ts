import { Body, Controller, Post } from '@nestjs/common';
import { CreateMessageUseCase } from './use-case';
import { CreateMessageDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('monolith-message')
@Controller({ path: 'monolith-message', version: ['1'] })
export class CreateMessageController {
  constructor(private readonly createMessageUseCase: CreateMessageUseCase) {}

  @Post()
  async createMessage(@Body() body: CreateMessageDto) {
    const message = await this.createMessageUseCase.execute({
      content: body.content,
      senderId: body.senderId,
      tenantId: body.tenantId,
      conversationId: body.conversationId,
      metadata: body.metadata,
    });

    return {
      message,
    };
  }
}
