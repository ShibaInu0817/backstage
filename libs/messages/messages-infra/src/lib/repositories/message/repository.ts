import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MessageDo, MessageDocument } from './schema';
import {
  MessageEntity,
  IMessageRepository,
} from '@boilerplate/messages-domain';

export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectModel(MessageDo.name)
    private readonly messageModel: Model<MessageDo>
  ) {}

  private toEntity(doObj: MessageDocument): MessageEntity {
    return new MessageEntity({
      id: doObj._id.toHexString(),
      conversationId: doObj.conversationId,
      senderId: doObj.senderId,
      content: doObj.content,
      tenantId: doObj.tenantId,
      timestamp: doObj.timestamp,
      metadata: doObj.metadata,
    });
  }

  private toPersistence(entity: MessageEntity): Partial<MessageDo> {
    return {
      _id: new mongoose.Types.ObjectId(entity.id),
      conversationId: entity.conversationId,
      senderId: entity.senderId,
      content: entity.content,
      tenantId: entity.tenantId,
      timestamp: entity.timestamp,
      metadata: entity.metadata,
    };
  }

  async findById(id: string): Promise<MessageEntity | null> {
    const doc = await this.messageModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(): Promise<MessageEntity[]> {
    const docs = await this.messageModel.find().exec();
    return docs.map(this.toEntity);
  }

  async create(entity: MessageEntity): Promise<MessageEntity> {
    const doc = new this.messageModel(this.toPersistence(entity));
    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async update(entity: MessageEntity): Promise<MessageEntity> {
    const updated = await this.messageModel
      .findByIdAndUpdate(entity.id, this.toPersistence(entity), { new: true })
      .exec();
    if (!updated) throw new Error('Update failed');
    return this.toEntity(updated);
  }
}
