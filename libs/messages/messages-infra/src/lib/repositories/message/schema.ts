import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseDo } from '@boilerplate/infra';

@Schema({
  timestamps: true,
  collection: 'messages',
})
export class MessageDo extends BaseDo {
  @Prop({ required: true, type: String })
  tenantId!: string;

  @Prop({ required: true, type: String })
  conversationId!: string;

  @Prop({ required: true, type: String })
  senderId!: string;

  @Prop({ required: true, type: String })
  content!: string;

  @Prop({ required: true, type: Date })
  timestamp!: Date;
}

// Create the schema from the class
export const MessageSchema = SchemaFactory.createForClass(MessageDo);
export type MessageDocument = HydratedDocument<MessageDo>;

// Create compound indexes for efficient queries
MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ content: 'text' });
MessageSchema.index({ tenantId: 1, conversationId: 1 });
