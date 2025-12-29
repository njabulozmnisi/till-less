import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Capture exception in Sentry (except for expected 4xx errors)
    if (status >= 500) {
      Sentry.captureException(exception, {
        extra: {
          url: request.url,
          method: request.method,
          body: request.body,
          params: request.params,
          query: request.query,
        },
        user: {
          id: (request as any).user?.id,
          email: (request as any).user?.email,
        },
      });
    }

    // Determine error response
    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode: status,
            message: 'Internal server error',
            error: 'Internal Server Error',
          };

    // Send response
    response.status(status).json(errorResponse);
  }
}
