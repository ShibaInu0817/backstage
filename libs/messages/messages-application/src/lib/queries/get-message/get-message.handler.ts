import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  MessageEntity,
} from '@boilerplate/messages-domain';
import { GetMessageQuery } from './get-message.query';
import { MessageNotFoundError } from './get-message.errors';

@Injectable()
@QueryHandler(GetMessageQuery)
export class GetMessageHandler implements IQueryHandler<GetMessageQuery> {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository
  ) {}

  async execute(query: GetMessageQuery): Promise<MessageEntity> {
    const message = await this.messageRepository.findById(query.id);

    if (!message) {
      throw new MessageNotFoundError(query.id);
    }

    return message;
  }
}
