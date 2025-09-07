import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'messages',
})
export class MessageDo {
  //#region  Id conversion
  // Handle the conversion of the MongoDB internal _id field to a string
  _id!: mongoose.Types.ObjectId;

  // Virtual getter/setter for id that maps to _id
  get id(): string {
    return this._id.toString();
  }
  set id(value: string) {
    this._id = new mongoose.Types.ObjectId(value);
  }
  //#endregion

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

  /**
   * Optional metadata associated with the message
   * Can contain additional properties like read status or any unexpected attributes, etc.
   */
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

// Create the schema from the class
export const MessageSchema = SchemaFactory.createForClass(MessageDo);
export type MessageDocument = HydratedDocument<MessageDo>;

// Create compound indexes for efficient queries
MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ content: 'text' });
MessageSchema.index({ tenantId: 1, conversationId: 1 });
