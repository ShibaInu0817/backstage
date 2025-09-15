export abstract class DomainError extends Error {
  abstract readonly code: string; // e.g., "MESSAGE_NOT_FOUND"
  readonly isDomainError = true;

  constructor(message: string) {
    super(message);
  }
}
