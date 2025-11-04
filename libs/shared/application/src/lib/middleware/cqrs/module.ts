import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandMiddleware } from './command.middleware';

@Module({
  imports: [CqrsModule],
  providers: [CommandMiddleware],
  exports: [CommandMiddleware],
})
export class CqrsMiddlewareModule {}
