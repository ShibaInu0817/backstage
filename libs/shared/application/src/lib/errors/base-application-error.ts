export abstract class ApplicationError extends Error {
  abstract readonly code: string; // e.g. SAVE_MESSAGE_FAILED
  readonly isApplicationError = true;

  constructor(message: string) {
    super(message);
  }
}
