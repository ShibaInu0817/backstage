export interface MessageProps {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  tenantId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class MessageEntity {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  content: string; // mutable
  readonly tenantId: string;
  readonly timestamp: Date;
  metadata?: Record<string, any>;

  constructor(props: MessageProps) {
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.content = props.content;
    this.tenantId = props.tenantId;
    this.timestamp = props.timestamp;
    this.metadata = props.metadata;
  }

  static create(props: Omit<MessageProps, 'timestamp'>): MessageEntity {
    return new MessageEntity({ ...props, timestamp: new Date() });
  }

  updateContent(newContent: string): void {
    if (!newContent?.trim()) throw new Error('Content cannot be empty');
    this.content = newContent;
  }
}
