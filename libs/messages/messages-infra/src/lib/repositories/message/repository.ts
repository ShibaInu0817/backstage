import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, FilterQuery } from 'mongoose';
import { MessageDo, MessageDocument } from './schema';
import {
  MessageEntity,
  IMessageRepository,
  PaginatedResult,
  PaginationOptions,
  FindByConversationIdFilter,
  SortOrder,
  CursorPaginationOptions,
  CursorPaginatedResult,
} from '@boilerplate/messages-domain';

interface CursorData {
  [key: string]: string | Date | number | boolean;
  _id: string;
}

export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectModel(MessageDo.name)
    private readonly messageModel: Model<MessageDo>
  ) {}

  private toEntity(doObj: MessageDocument): MessageEntity {
    return new MessageEntity({
      id: doObj._id.toHexString(),
      conversationId: doObj.conversationId,
      senderId: doObj.senderId,
      content: doObj.content,
      tenantId: doObj.tenantId,
      timestamp: doObj.timestamp,
      metadata: doObj.metadata,
    });
  }

  private toPersistence(entity: MessageEntity): Partial<MessageDo> {
    return {
      _id: new mongoose.Types.ObjectId(entity.id),
      conversationId: entity.conversationId,
      senderId: entity.senderId,
      content: entity.content,
      tenantId: entity.tenantId,
      timestamp: entity.timestamp,
      metadata: entity.metadata,
    };
  }

  private encodeCursor(data: CursorData): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): CursorData {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      throw new Error('Invalid cursor format');
    }
  }

  private buildCursorQuery(
    baseQuery: FilterQuery<MessageDo>,
    cursor: CursorData,
    sortBy: string,
    sortOrder: SortOrder
  ): FilterQuery<MessageDo> {
    const cursorValue = cursor[sortBy];
    const cursorId = cursor._id;

    if (sortOrder === SortOrder.DESC) {
      return {
        ...baseQuery,
        $or: [
          { [sortBy]: { $lt: cursorValue } },
          {
            [sortBy]: cursorValue,
            _id: { $lt: new mongoose.Types.ObjectId(cursorId) },
          },
        ],
      };
    } else {
      return {
        ...baseQuery,
        $or: [
          { [sortBy]: { $gt: cursorValue } },
          {
            [sortBy]: cursorValue,
            _id: { $gt: new mongoose.Types.ObjectId(cursorId) },
          },
        ],
      };
    }
  }

  async findById(id: string): Promise<MessageEntity | null> {
    const doc = await this.messageModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(): Promise<MessageEntity[]> {
    const docs = await this.messageModel.find().exec();
    return docs.map(this.toEntity);
  }

  async create(entity: MessageEntity): Promise<MessageEntity> {
    const doc = new this.messageModel(this.toPersistence(entity));
    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async update(entity: MessageEntity): Promise<MessageEntity> {
    const updated = await this.messageModel
      .findByIdAndUpdate(entity.id, this.toPersistence(entity), { new: true })
      .exec();
    if (!updated) throw new Error('Update failed');
    return this.toEntity(updated);
  }

  async findByConversationId(
    filter: FindByConversationIdFilter,
    options: PaginationOptions
  ): Promise<PaginatedResult<MessageEntity>> {
    const {
      page,
      limit,
      sortBy = 'timestamp',
      sortOrder = SortOrder.DESC,
    } = options;

    // Build the filter query
    const query: FilterQuery<MessageDo> = {
      conversationId: filter.conversationId,
    };

    // Add optional filters
    if (filter.tenantId) {
      query.tenantId = filter.tenantId;
    }

    if (filter.senderId) {
      query.senderId = filter.senderId;
    }

    // Date range filter
    if (filter.startDate || filter.endDate) {
      query.timestamp = {};
      if (filter.startDate) {
        query.timestamp.$gte = filter.startDate;
      }
      if (filter.endDate) {
        query.timestamp.$lte = filter.endDate;
      }
    }

    // Text search filter
    if (filter.searchText) {
      query.$text = { $search: filter.searchText };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === SortOrder.ASC ? 1 : -1,
    };

    // Execute query with pagination
    const [docs, total] = await Promise.all([
      this.messageModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments(query).exec(),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: docs.map((doc) => this.toEntity(doc)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async findByConversationIdCursor(
    filter: FindByConversationIdFilter,
    options: CursorPaginationOptions
  ): Promise<CursorPaginatedResult<MessageEntity>> {
    const {
      limit,
      cursor,
      sortBy = 'timestamp',
      sortOrder = SortOrder.DESC,
    } = options;

    // Build base filter query
    const baseQuery: FilterQuery<MessageDo> = {
      conversationId: filter.conversationId,
    };

    // Add optional filters
    if (filter.tenantId) {
      baseQuery.tenantId = filter.tenantId;
    }

    if (filter.senderId) {
      baseQuery.senderId = filter.senderId;
    }

    // Date range filter
    if (filter.startDate || filter.endDate) {
      baseQuery.timestamp = {};
      if (filter.startDate) {
        baseQuery.timestamp.$gte = filter.startDate;
      }
      if (filter.endDate) {
        baseQuery.timestamp.$lte = filter.endDate;
      }
    }

    // Text search filter
    if (filter.searchText) {
      baseQuery.$text = { $search: filter.searchText };
    }

    // Apply cursor if provided
    let query: FilterQuery<MessageDo> = baseQuery;
    if (cursor) {
      const cursorData = this.decodeCursor(cursor);
      query = this.buildCursorQuery(baseQuery, cursorData, sortBy, sortOrder);
    }

    // Build sort object - always include _id for consistent ordering
    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === SortOrder.ASC ? 1 : -1,
      _id: sortOrder === SortOrder.ASC ? 1 : -1,
    };

    // Fetch limit + 1 to determine if there are more results
    const docs = await this.messageModel
      .find(query)
      .sort(sortOptions)
      .limit(limit + 1)
      .exec();

    // Check if there are more results
    const hasMore = docs.length > limit;

    // Remove the extra document if it exists
    const results = hasMore ? docs.slice(0, limit) : docs;

    // Generate cursors
    let nextCursor: string | null = null;
    let previousCursor: string | null = null;

    if (results.length > 0) {
      // Next cursor from the last item
      if (hasMore) {
        const lastDoc = results[results.length - 1];
        nextCursor = this.encodeCursor({
          [sortBy]: lastDoc[sortBy as keyof MessageDocument],
          _id: lastDoc._id.toHexString(),
        });
      }

      // Previous cursor from the first item (for potential backward pagination)
      const firstDoc = results[0];
      previousCursor = this.encodeCursor({
        [sortBy]: firstDoc[sortBy as keyof MessageDocument],
        _id: firstDoc._id.toHexString(),
      });
    }

    return {
      data: results.map((doc) => this.toEntity(doc)),
      pagination: {
        limit,
        hasMore,
        nextCursor,
        previousCursor: cursor ? previousCursor : null, // Only provide previous cursor if we're paginating
      },
    };
  }
}
