import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessageResponseDto, UpdateMessageCommand } from '@boilerplate/messages-application';
import { UpdateMessageDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard, CurrentUserSession, UserSession } from '@boilerplate/auth';

@ApiTags('message')
@ApiBearerAuth()
@Controller({ path: 'message', version: ['1'] })
@UseGuards(ClerkAuthGuard)
export class UpdateMessageController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch('conversations/:conversationId/messages/:id')
  async updateMessage(
    @Param('conversationId') conversationId: string,
    @Param('id') id: string,
    @Body() body: UpdateMessageDto,
    @CurrentUserSession() session: UserSession
  ) {
    const command = new UpdateMessageCommand(
      id,
      session.tenantId,
      conversationId,
      body.content,
      body.metadata
    );

    const message = await this.commandBus.execute(command);

    return MessageResponseDto.fromEntity(message);
  }
}
