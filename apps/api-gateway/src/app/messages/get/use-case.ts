import {
  type IMessageRepository,
  MESSAGE_REPOSITORY_TOKEN,
  MessageEntity,
  MessageNotFoundError,
} from '@boilerplate/messages-domain';
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

  async execute(dto: GetMessageDto): Promise<Result<MessageEntity, Error>> {
    const message = await this.messageRepository.findById(dto.id);

    if (!message) {
      return Err(new MessageNotFoundError(dto.id));
    }
    return Ok(message);
  }
}

// TODO: Move to shared/common
export type Result<T, E extends Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function Ok<T>(value: T): Result<T, Error> {
  return { ok: true, value };
}

export function Err<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error };
}
