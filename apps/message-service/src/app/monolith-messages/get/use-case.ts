import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  MessageEntity,
} from '@boilerplate/messages-domain';
import { MessageNotFoundError } from '@boilerplate/messages-application';
import { Injectable, Inject } from '@nestjs/common';

interface GetMessageDto {
  id: string;
}

@Injectable()
export class GetMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: IMessageRepository
  ) {}

  async execute(dto: GetMessageDto): Promise<MessageEntity> {
    const message = await this.messageRepository.findById(dto.id);

    if (!message) {
      throw new MessageNotFoundError(dto.id);
    }

    return message;
  }
}
