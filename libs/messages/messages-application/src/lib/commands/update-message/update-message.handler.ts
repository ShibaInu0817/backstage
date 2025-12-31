import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  MessageEntity,
} from '@boilerplate/messages-domain';
import { type IUnitOfWork, UNIT_OF_WORK_TOKEN } from '@boilerplate/domain';
import { UpdateMessageCommand } from './update-message.command';

@Injectable()
@CommandHandler(UpdateMessageCommand)
export class UpdateMessageHandler
  implements ICommandHandler<UpdateMessageCommand>
{
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository,
    @Inject(UNIT_OF_WORK_TOKEN)
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute(command: UpdateMessageCommand): Promise<MessageEntity> {
    return await this.unitOfWork.executeInTransaction(async () => {
      const message = await this.messageRepository.findById(command.id);

      if (!message) {
        throw new NotFoundException(`Message with id ${command.id} not found`);
      }

      // Authorization & Integrity checks
      if (message.tenantId !== command.tenantId) {
         throw new Error('Tenant mismatch');
      }

      if (message.conversationId !== command.conversationId) {
        throw new Error('Conversation mismatch');
      }

      message.update({
        content: command.content,
        metadata: command.metadata,
      });

      const updatedMessage = await this.messageRepository.update(
        message,
        this.unitOfWork
      );

      return updatedMessage;
    });
  }
}
