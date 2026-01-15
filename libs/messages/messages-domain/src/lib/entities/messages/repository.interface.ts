import { MessageEntity } from './entity';
import { IUnitOfWork } from '@boilerplate/domain';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CursorPaginationOptions {
  limit: number;
  cursor?: string; // Base64 encoded cursor
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
    previousCursor: string | null;
  };
}

export interface FindByConversationIdFilter {
  conversationId: string;
  tenantId?: string;
  senderId?: string;
  startDate?: Date;
  endDate?: Date;
  searchText?: string;
}

export interface IMessageRepository {
  create(message: MessageEntity, uow?: IUnitOfWork): Promise<MessageEntity>;
  update(message: MessageEntity, uow?: IUnitOfWork): Promise<MessageEntity>;
  findAll(): Promise<MessageEntity[]>;
  findById(id: string): Promise<MessageEntity | null>;
  findByConversationId(
    filter: FindByConversationIdFilter,
    options: PaginationOptions
  ): Promise<PaginatedResult<MessageEntity>>;
  findByConversationIdCursor(
    filter: FindByConversationIdFilter,
    options: CursorPaginationOptions
  ): Promise<CursorPaginatedResult<MessageEntity>>;
}

// Dependency Injection Token for Repository Interface
export const MESSAGE_REPOSITORY_TOKEN = 'IMessageRepository';
