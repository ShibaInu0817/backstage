import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SortOrder } from '@boilerplate/messages-domain';
import { ListMessagesQuery } from '@boilerplate/messages-application';
import { ListMessagesQueryDto } from './query.dto';

@ApiTags('message')
@Controller({ path: 'messages', version: ['1'] })
export class ListMessagesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'List messages by conversation ID',
    description:
      'Retrieves a paginated list of messages for a specific conversation with filtering and sorting options',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async listMessages(@Query() query: ListMessagesQueryDto) {
    const listQuery = new ListMessagesQuery(
      query.conversationId,
      query.limit ?? 20,
      query.sortBy ?? 'timestamp',
      query.sortOrder ?? SortOrder.DESC,
      query.tenantId,
      query.senderId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.searchText,
      query.cursor
    );

    const result = await this.queryBus.execute(listQuery);

    return result;
  }
}
