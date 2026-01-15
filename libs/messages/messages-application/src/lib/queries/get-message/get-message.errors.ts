import { ApplicationError } from '@boilerplate/application';

export class MessageNotFoundError extends ApplicationError {
  readonly code = 'MESSAGE_NOT_FOUND';

  constructor(id: string) {
    super(`Message with id ${id} was not found`);
  }
}
