import { BaseEntity, BaseEntityProps } from '@boilerplate/domain';

export interface MessageProps extends BaseEntityProps {
  conversationId: string;
  senderId: string;
  content: string;
  tenantId: string;
  timestamp: Date;
}

export class MessageEntity extends BaseEntity {
  readonly conversationId: string;
  readonly senderId: string;
  content: string; // mutable
  readonly tenantId: string;
  readonly timestamp: Date;

  constructor(props: MessageProps) {
    super(props);
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.content = props.content;
    this.tenantId = props.tenantId;
    this.timestamp = props.timestamp;
  }

  static create(props: Omit<MessageProps, 'timestamp' | 'version'>): MessageEntity {
    return new MessageEntity({
      ...props,
      timestamp: new Date(),
      version: 1,
    });
  }

  updateContent(newContent: string): void {
    if (!newContent?.trim()) throw new Error('Content cannot be empty');
    this.content = newContent;
  }
}
