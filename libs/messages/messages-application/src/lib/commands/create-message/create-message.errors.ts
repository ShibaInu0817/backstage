import { ApplicationError } from '@boilerplate/application';

export class SaveMessageFailedError extends ApplicationError {
  readonly code = 'SAVE_MESSAGE_FAILED';

  constructor(reason: string) {
    super(`Failed to save message: ${reason}`);
  }
}
