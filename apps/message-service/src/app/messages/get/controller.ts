import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  GetMessageQuery,
  MessageResponseDto,
} from '@boilerplate/messages-application';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { MessageEntity } from '@boilerplate/messages-domain';

@ApiTags('message')
@Controller({ path: 'message', version: ['1'] })
export class GetMessageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @ApiOkResponse({ type: MessageResponseDto })
  async getData(@Param('id') id: string): Promise<MessageResponseDto> {
    const query = new GetMessageQuery(id);
    const message = await this.queryBus.execute<GetMessageQuery, MessageEntity>(
      query
    );

    return MessageResponseDto.fromEntity(message);
  }
}
