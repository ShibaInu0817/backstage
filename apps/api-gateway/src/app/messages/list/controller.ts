import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SortOrder } from '@boilerplate/messages-domain';
import { ListMessagesUseCase } from './use-case';
import { ListMessagesQueryDto } from './query.dto';

@ApiTags('message')
@Controller({ path: 'messages', version: ['1'] })
export class ListMessagesController {
  private readonly logger = new Logger(ListMessagesController.name);

  constructor(private readonly listMessagesUseCase: ListMessagesUseCase) {}

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
    this.logger.debug(
      `Listing messages for conversation ${
        query.conversationId
      } with cursor pagination, limit=${query.limit}, cursor=${
        query.cursor ? 'provided' : 'none'
      }`
    );

    const result = await this.listMessagesUseCase.execute({
      conversationId: query.conversationId,
      tenantId: query.tenantId,
      senderId: query.senderId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      searchText: query.searchText,
      cursor: query.cursor,
      limit: query.limit ?? 20,
      sortBy: query.sortBy ?? 'timestamp',
      sortOrder: query.sortOrder ?? SortOrder.DESC,
    });

    return result;
  }
}
