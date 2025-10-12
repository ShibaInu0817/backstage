import { DomainError } from '@boilerplate/domain';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationError } from '@boilerplate/application';

interface ErrorResponse {
  ok: false;
  error: {
    type: string;
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
  };
}

@Catch(Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const timestamp = new Date().toISOString();

    if (this.isDomainError(exception)) {
      return this.handleDomainError(
        exception as DomainError,
        response,
        timestamp
      );
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, response, timestamp);
    }

    if (this.isApplicationError(exception)) {
      return this.handleApplicationError(
        exception as ApplicationError,
        response,
        timestamp
      );
    }

    return this.handleUnexpectedError(exception, response, timestamp);
  }

  private isDomainError(exception: Error): boolean {
    return (exception as any).isDomainError === true;
  }

  private isApplicationError(exception: Error): boolean {
    return (exception as any).isApplicationError === true;
  }

  private handleDomainError(
    error: DomainError,
    response: Response,
    timestamp: string
  ) {
    const status = this.getDomainErrorStatus(error);
    const errorResponse = this.createErrorResponse(
      'DOMAIN_ERROR',
      error.code,
      error.message,
      timestamp
    );

    return response.status(status).json(errorResponse);
  }

  private handleHttpException(
    exception: HttpException,
    response: Response,
    timestamp: string
  ) {
    const status = exception.getStatus();
    const message = this.extractHttpExceptionMessage(exception);
    const code = this.extractHttpExceptionCode(exception);

    const errorResponse = this.createErrorResponse(
      'HTTP_EXCEPTION',
      code,
      message,
      timestamp
    );

    return response.status(status).json(errorResponse);
  }

  private handleApplicationError(
    error: ApplicationError,
    response: Response,
    timestamp: string
  ) {
    const errorResponse = this.createErrorResponse(
      'APPLICATION_ERROR',
      error.code,
      error.message,
      timestamp
    );

    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }

  private handleUnexpectedError(
    exception: Error,
    response: Response,
    timestamp: string
  ) {
    const errorResponse = this.createErrorResponse(
      'UNEXPECTED_ERROR',
      'INTERNAL_SERVER_ERROR',
      exception.message,
      timestamp
    );

    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }

  private getDomainErrorStatus(error: DomainError): HttpStatus {
    return error.code.includes('NOT_FOUND')
      ? HttpStatus.NOT_FOUND
      : HttpStatus.BAD_REQUEST;
  }

  private extractHttpExceptionMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const responseMessage = (exceptionResponse as any).message;
      return Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : responseMessage;
    }

    return exception.message;
  }

  private extractHttpExceptionCode(exception: HttpException): string {
    return exception.name.replace('Exception', '').toUpperCase();
  }

  private createErrorResponse(
    type: string,
    code: string,
    message: string,
    timestamp: string
  ): ErrorResponse {
    return {
      ok: false,
      error: {
        type,
        code,
        message,
      },
      meta: {
        timestamp,
      },
    };
  }
}
