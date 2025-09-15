export class MessageNotFoundError extends Error {
  constructor(id: string) {
    super(`Message with id ${id} was not found`);
    this.name = 'MessageNotFoundError';
  }
}
