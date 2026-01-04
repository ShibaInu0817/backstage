import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetMessageQuery,
  MessageResponseDto,
} from '@boilerplate/messages-application';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessageEntity } from '@boilerplate/messages-domain';
import { ClerkAuthGuard, CurrentUserSession, UserSession } from '@boilerplate/auth';

@ApiTags('message')
@ApiBearerAuth()
@Controller({ path: 'message', version: ['1'] })
@UseGuards(ClerkAuthGuard)
export class GetMessageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @ApiOkResponse({ type: MessageResponseDto })
  async getData(
    @Param('id') id: string,
    @CurrentUserSession() session: UserSession
  ): Promise<MessageResponseDto> {
    const query = new GetMessageQuery(id, session.tenantId);
    const message = await this.queryBus.execute<GetMessageQuery, MessageEntity>(
      query
    );

    return MessageResponseDto.fromEntity(message);
  }
}
