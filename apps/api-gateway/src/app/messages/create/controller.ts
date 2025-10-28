import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateMessageCommand } from '@boilerplate/messages-application';
import { CreateMessageDto } from './dto';

@Controller({ path: 'message', version: ['1'] })
export class CreateMessageController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createMessage(@Body() body: CreateMessageDto) {
    const command = new CreateMessageCommand(
      body.tenantId,
      body.conversationId,
      body.senderId,
      body.content,
      body.metadata
    );

    const message = await this.commandBus.execute(command);

    return {
      message,
    };
  }
}
