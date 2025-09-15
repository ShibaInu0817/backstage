import { DomainError } from '@boilerplate/domain';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationError } from '@boilerplate/application';

@Catch(Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const timestamp = new Date().toISOString();

    // ✅ Handle domain errors (business rule violations)
    if ((exception as any).isDomainError) {
      const domainError = exception as DomainError;

      // You can refine: NotFoundError → 404, ValidationError → 400
      const status = domainError.code.includes('NOT_FOUND')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;

      return response.status(status).json({
        ok: false,
        error: {
          type: 'DOMAIN_ERROR',
          code: domainError.code,
          message: domainError.message,
        },
        meta: { timestamp },
      });
    }

    // ✅ Handle application errors (use case orchestration failures)
    if ((exception as any).isApplicationError) {
      const appError = exception as ApplicationError;

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        ok: false,
        error: {
          type: 'APPLICATION_ERROR',
          code: appError.code,
          message: appError.message,
        },
        meta: { timestamp },
      });
    }

    // ❌ Unexpected/unhandled errors
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ok: false,
      error: {
        type: 'UNEXPECTED_ERROR',
        code: 'INTERNAL_SERVER_ERROR',
        message: exception.message,
      },
      meta: { timestamp },
    });
  }
}
