import { SortOrder } from '@boilerplate/messages-domain';

export class ListMessagesQuery {
  constructor(
    public readonly conversationId: string,
    public readonly limit: number,
    public readonly sortBy: string,
    public readonly sortOrder: SortOrder,
    public readonly tenantId?: string,
    public readonly senderId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly searchText?: string,
    public readonly cursor?: string
  ) {}
}
