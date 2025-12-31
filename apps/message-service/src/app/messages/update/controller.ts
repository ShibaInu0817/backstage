import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessageResponseDto, UpdateMessageCommand } from '@boilerplate/messages-application';
import { UpdateMessageDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('message')
@Controller({ path: 'message', version: ['1'] })
export class UpdateMessageController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch('conversations/:conversationId/messages/:id')
  async updateMessage(
    @Param('conversationId') conversationId: string,
    @Param('id') id: string,
    @Body() body: UpdateMessageDto
  ) {
    const command = new UpdateMessageCommand(
      id,
      body.tenantId,
      conversationId,
      body.content,
      body.metadata
    );

    const message = await this.commandBus.execute(command);

    return MessageResponseDto.fromEntity(message);
  }
}
