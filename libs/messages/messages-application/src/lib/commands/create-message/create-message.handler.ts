import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  MessageEntity,
} from '@boilerplate/messages-domain';
import { type IUnitOfWork, UNIT_OF_WORK_TOKEN } from '@boilerplate/domain';
import { ObjectId } from 'mongodb';
import { CreateMessageCommand } from './create-message.command';
import { SaveMessageFailedError } from './create-message.errors';

@Injectable()
@CommandHandler(CreateMessageCommand)
export class CreateMessageHandler
  implements ICommandHandler<CreateMessageCommand>
{
  private readonly logger = new Logger(CreateMessageCommand.name);

  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository,
    @Inject(UNIT_OF_WORK_TOKEN)
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute(command: CreateMessageCommand): Promise<MessageEntity> {
    this.logger.debug('CreateMessageHandler', command);

    try {
      return await this.unitOfWork.executeInTransaction(async () => {
        // Domain decides how to construct a valid Message
        const newMessage = MessageEntity.create({
          id: new ObjectId().toString(),
          tenantId: command.tenantId,
          conversationId: command.conversationId,
          senderId: command.senderId,
          content: command.content,
          metadata: command.metadata,
        });

        // Save to repository within the transaction
        const savedMessage = await this.messageRepository.create(
          newMessage,
          this.unitOfWork
        );

        // Future: Write to outbox in the same transaction
        // await this.outboxRepository.insert({
        //   eventId: `message:${savedMessage.id}:v1`,
        //   aggregateId: savedMessage.id,
        //   eventType: 'MessageCreated',
        //   payload: savedMessage,
        //   status: 'PENDING',
        //   createdAt: new Date(),
        // }, this.unitOfWork);

        return savedMessage;
      });
    } catch (err: any) {
      // Repository threw an infra error (DB-level)
      throw new SaveMessageFailedError(err.message);
    }
  }
}
