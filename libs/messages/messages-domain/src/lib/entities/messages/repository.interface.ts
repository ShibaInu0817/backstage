import { MessageEntity } from './entity';

export interface IMessageRepository {
  create(message: MessageEntity): Promise<MessageEntity>;
  findAll(): Promise<MessageEntity[]>;
  findById(id: string): Promise<MessageEntity | null>;
}

// Dependency Injection Token for Repository Interface
export const MESSAGE_REPOSITORY_TOKEN = 'IMessageRepository';
