import { Test, TestingModule } from '@nestjs/testing';
import { ListMessagesUseCase } from './use-case';
import {
  MESSAGE_REPOSITORY_TOKEN,
  IMessageRepository,
  MessageEntity,
  SortOrder,
} from '@boilerplate/messages-domain';

describe('ListMessagesUseCase', () => {
  let useCase: ListMessagesUseCase;
  let mockRepository: jest.Mocked<IMessageRepository>;

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      findByConversationIdCursor: jest.fn(),
      findByConversationId: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListMessagesUseCase,
        {
          provide: MESSAGE_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListMessagesUseCase>(ListMessagesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return cursor paginated messages', async () => {
      // Arrange
      const conversationId = '507f1f77bcf86cd799439011';
      const mockMessages = [
        new MessageEntity({
          id: '1',
          conversationId,
          senderId: 'user1',
          content: 'Hello',
          tenantId: 'tenant1',
          timestamp: new Date('2024-10-12T10:00:00Z'),
        }),
        new MessageEntity({
          id: '2',
          conversationId,
          senderId: 'user2',
          content: 'Hi there',
          tenantId: 'tenant1',
          timestamp: new Date('2024-10-12T10:01:00Z'),
        }),
      ];

      const mockResult = {
        data: mockMessages,
        pagination: {
          limit: 20,
          hasMore: false,
          nextCursor: null,
          previousCursor: null,
        },
      };

      mockRepository.findByConversationIdCursor.mockResolvedValue(mockResult);

      // Act
      const result = await useCase.execute({
        conversationId,
        limit: 20,
        sortBy: 'timestamp',
        sortOrder: SortOrder.DESC,
      });

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockRepository.findByConversationIdCursor).toHaveBeenCalledWith(
        {
          conversationId,
          tenantId: undefined,
          senderId: undefined,
          startDate: undefined,
          endDate: undefined,
          searchText: undefined,
        },
        {
          cursor: undefined,
          limit: 20,
          sortBy: 'timestamp',
          sortOrder: SortOrder.DESC,
        }
      );
    });

    it('should apply all filters when provided', async () => {
      // Arrange
      const conversationId = '507f1f77bcf86cd799439011';
      const tenantId = 'tenant123';
      const senderId = 'user456';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const searchText = 'hello';

      const mockResult = {
        data: [],
        pagination: {
          limit: 10,
          hasMore: false,
          nextCursor: null,
          previousCursor: null,
        },
      };

      mockRepository.findByConversationIdCursor.mockResolvedValue(mockResult);

      // Act
      await useCase.execute({
        conversationId,
        tenantId,
        senderId,
        startDate,
        endDate,
        searchText,
        limit: 10,
        sortBy: 'timestamp',
        sortOrder: SortOrder.ASC,
      });

      // Assert
      expect(mockRepository.findByConversationIdCursor).toHaveBeenCalledWith(
        {
          conversationId,
          tenantId,
          senderId,
          startDate,
          endDate,
          searchText,
        },
        {
          cursor: undefined,
          limit: 10,
          sortBy: 'timestamp',
          sortOrder: SortOrder.ASC,
        }
      );
    });

    it('should handle cursor pagination correctly', async () => {
      // Arrange
      const conversationId = '507f1f77bcf86cd799439011';
      const cursor = 'eyJ0aW1lc3RhbXAiOjE2OTc...';
      const mockResult = {
        data: [],
        pagination: {
          limit: 20,
          hasMore: true,
          nextCursor: 'eyJuZXh0Q3Vyc29yIjoidGVzdCJ9',
          previousCursor: cursor,
        },
      };

      mockRepository.findByConversationIdCursor.mockResolvedValue(mockResult);

      // Act
      const result = await useCase.execute({
        conversationId,
        cursor,
        limit: 20,
        sortBy: 'timestamp',
        sortOrder: SortOrder.DESC,
      });

      // Assert
      expect(result.pagination.hasMore).toBe(true);
      expect(result.pagination.nextCursor).toBe('eyJuZXh0Q3Vyc29yIjoidGVzdCJ9');
      expect(result.pagination.previousCursor).toBe(cursor);
      expect(result.pagination.limit).toBe(20);
    });

    it('should use custom sort options', async () => {
      // Arrange
      const conversationId = '507f1f77bcf86cd799439011';
      const mockResult = {
        data: [],
        pagination: {
          limit: 20,
          hasMore: false,
          nextCursor: null,
          previousCursor: null,
        },
      };

      mockRepository.findByConversationIdCursor.mockResolvedValue(mockResult);

      // Act
      await useCase.execute({
        conversationId,
        limit: 20,
        sortBy: 'senderId',
        sortOrder: SortOrder.ASC,
      });

      // Assert
      expect(mockRepository.findByConversationIdCursor).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          sortBy: 'senderId',
          sortOrder: SortOrder.ASC,
        })
      );
    });
  });
});
