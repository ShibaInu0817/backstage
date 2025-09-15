import { DomainError } from '@boilerplate/domain';

export class MessageNotFoundError extends DomainError {
  readonly code = 'MESSAGE_NOT_FOUND';

  constructor(id: string) {
    super(`Message with id ${id} was not found`);
  }
}
