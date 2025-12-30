import { ApiProperty } from '@nestjs/swagger';
import { MessageEntity } from '@boilerplate/messages-domain';

export class MessageResponseDto {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly conversationId: string;

  @ApiProperty()
  readonly senderId: string;

  @ApiProperty()
  readonly content: string;

  @ApiProperty()
  readonly tenantId: string;

  @ApiProperty()
  readonly timestamp: Date;

  @ApiProperty({ required: false })
  readonly metadata?: Record<string, any>;

  constructor(entity: MessageEntity) {
    this.id = entity.id;
    this.conversationId = entity.conversationId;
    this.senderId = entity.senderId;
    this.content = entity.content;
    this.tenantId = entity.tenantId;
    this.timestamp = entity.timestamp;
    this.metadata = entity.metadata;
  }

  static fromEntity(entity: MessageEntity): MessageResponseDto {
    return new MessageResponseDto(entity);
  }
}
