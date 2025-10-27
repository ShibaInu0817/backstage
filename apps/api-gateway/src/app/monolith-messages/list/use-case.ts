import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  CursorPaginatedResult,
  MessageEntity,
  FindByConversationIdFilter,
  CursorPaginationOptions,
  SortOrder,
} from '@boilerplate/messages-domain';
import { Injectable, Inject } from '@nestjs/common';

export interface ListMessagesDto {
  conversationId: string;
  tenantId?: string;
  senderId?: string;
  startDate?: Date;
  endDate?: Date;
  searchText?: string;
  cursor?: string;
  limit: number;
  sortBy: string;
  sortOrder: SortOrder;
}

@Injectable()
export class ListMessagesUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository
  ) {}

  async execute(
    dto: ListMessagesDto
  ): Promise<CursorPaginatedResult<MessageEntity>> {
    const filter: FindByConversationIdFilter = {
      conversationId: dto.conversationId,
      tenantId: dto.tenantId,
      senderId: dto.senderId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      searchText: dto.searchText,
    };

    const options: CursorPaginationOptions = {
      cursor: dto.cursor,
      limit: dto.limit,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
    };

    return await this.messageRepository.findByConversationIdCursor(
      filter,
      options
    );
  }
}
