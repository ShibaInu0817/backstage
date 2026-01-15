import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateMessageCommand } from '@boilerplate/messages-application';
import { CreateMessageDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard, CurrentUserSession, UserSession } from '@boilerplate/auth';

@ApiTags('message')
@ApiBearerAuth()
@Controller({ path: 'message', version: ['1'] })
@UseGuards(ClerkAuthGuard)
export class CreateMessageController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
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

    return {
      message,
    };
  }
}
