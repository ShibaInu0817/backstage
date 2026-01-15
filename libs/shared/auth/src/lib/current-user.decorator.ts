import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserSession } from './types';

export const CurrentUserSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserSession => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
