import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  MessageEntity,
} from '@boilerplate/messages-domain';
import { ObjectId } from 'mongodb';
import { CreateMessageCommand } from '@boilerplate/messages-application';
import { SaveMessageFailedError } from './errors';

@Injectable()
@CommandHandler(CreateMessageCommand)
export class CreateMessageHandler
  implements ICommandHandler<CreateMessageCommand>
{
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository
  ) {}

  async execute(command: CreateMessageCommand): Promise<MessageEntity> {
    console.log('CreateMessageHandler', command);
    // Domain decides how to construct a valid Message
    const newMessage = MessageEntity.create({
      id: new ObjectId().toString(),
      tenantId: command.tenantId,
      conversationId: command.conversationId,
      senderId: command.senderId,
      content: command.content,
      metadata: command.metadata,
    });

    try {
      return await this.messageRepository.create(newMessage);
    } catch (err: any) {
      // Repository threw an infra error (DB-level)
      throw new SaveMessageFailedError(err.message);
    }
  }
}
