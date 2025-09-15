import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  MessageEntity,
} from '@boilerplate/messages-domain';
import { ObjectId } from 'mongodb';
import { Injectable, Inject } from '@nestjs/common';

interface CreateMessageDto {
  tenantId: string;
  conversationId: string;
  senderId: string;
  content: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CreateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository
  ) {}

  async execute(dto: CreateMessageDto): Promise<MessageEntity> {
    // 👇 Domain decides how to construct a valid Message
    const newMessage = MessageEntity.create({
      id: new ObjectId().toString(),
      tenantId: dto.tenantId,
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      content: dto.content,
      metadata: dto.metadata,
    });

    // 👇 Repo handles persistence (will return a hydrated entity)
    return this.messageRepository.create(newMessage);
  }
}
