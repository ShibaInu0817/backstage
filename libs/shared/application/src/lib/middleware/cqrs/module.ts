import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandMiddleware } from './command.middleware';
import { QueryMiddleware } from './query.middleware';

@Module({
  imports: [CqrsModule],
  providers: [CommandMiddleware, QueryMiddleware],
  exports: [CommandMiddleware, QueryMiddleware],
})
export class CqrsMiddlewareModule {}
