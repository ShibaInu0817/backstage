import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  MessageEntity,
} from '@boilerplate/messages-domain';
import { ObjectId } from 'mongodb';
import { Injectable, Inject } from '@nestjs/common';
import { ApplicationError } from '@boilerplate/application';

interface CreateMessageDto {
  tenantId: string;
  conversationId: string;
  senderId: string;
  content: string;
  metadata?: Record<string, any>;
}

export class SaveMessageFailedError extends ApplicationError {
  readonly code = 'SAVE_MESSAGE_FAILED';

  constructor(reason: string) {
    super(`Failed to save message: ${reason}`);
  }
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

    try {
      return await this.messageRepository.create(newMessage);
    } catch (err: any) {
      // Repository threw an infra error (DB-level)
      throw new SaveMessageFailedError(err.message); // wrap into application error
    }
  }
}
