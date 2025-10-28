export class CreateMessageCommand {
  constructor(
    public readonly tenantId: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly metadata?: Record<string, any>
  ) {}
}
