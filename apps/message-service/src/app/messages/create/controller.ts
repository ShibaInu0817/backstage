import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateMessageCommand, MessageResponseDto } from '@boilerplate/messages-application';
import { CreateMessageDto } from './dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard, CurrentUserSession, UserSession } from '@boilerplate/auth';

@ApiTags('message')
@ApiBearerAuth()
@Controller({ path: 'message', version: ['1'] })
@UseGuards(ClerkAuthGuard)
export class CreateMessageController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Create message', description: 'Creates a new message based on the provided data' })
  @ApiOkResponse({ type: MessageResponseDto })
  async createMessage(
    @Body() body: CreateMessageDto,
    @CurrentUserSession() session: UserSession
  ) {
    const command = new CreateMessageCommand(
      session.tenantId,
      body.conversationId,
      session.userId,
      body.content,
      body.metadata
    );

    const message = await this.commandBus.execute(command);

    return MessageResponseDto.fromEntity(message);
  }
}
