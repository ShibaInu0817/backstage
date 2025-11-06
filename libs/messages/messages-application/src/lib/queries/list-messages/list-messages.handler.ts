import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  CursorPaginatedResult,
  MessageEntity,
  FindByConversationIdFilter,
  CursorPaginationOptions,
} from '@boilerplate/messages-domain';
import { ListMessagesQuery } from './list-messages.query';

@Injectable()
@QueryHandler(ListMessagesQuery)
export class ListMessagesHandler implements IQueryHandler<ListMessagesQuery> {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository
  ) {}

  async execute(
    query: ListMessagesQuery
  ): Promise<CursorPaginatedResult<MessageEntity>> {
    const filter: FindByConversationIdFilter = {
      conversationId: query.conversationId,
      tenantId: query.tenantId,
      senderId: query.senderId,
      startDate: query.startDate,
      endDate: query.endDate,
      searchText: query.searchText,
    };

    const options: CursorPaginationOptions = {
      cursor: query.cursor,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    return await this.messageRepository.findByConversationIdCursor(
      filter,
      options
    );
  }
}
