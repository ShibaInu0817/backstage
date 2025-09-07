import { MessageEntity } from './entity';

export interface IMessageRepository {
  create(message: MessageEntity): Promise<MessageEntity>;
  findAll(): Promise<MessageEntity[]>;
}
