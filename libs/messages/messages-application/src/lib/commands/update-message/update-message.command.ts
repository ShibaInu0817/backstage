import { ICommand } from '@nestjs/cqrs';

export class UpdateMessageCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly conversationId: string,
    public readonly content?: string,
    public readonly metadata?: Record<string, any>
  ) {}
}
