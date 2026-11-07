import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { ResponseCode, ResponseUtil } from '../reponse/base.response';

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let code = ResponseCode.SERVER_ERROR;
    let message = 'Internal server error';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errors = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object') {
        const resObj = response as any;
        message = resObj.message || message;
        errors = resObj.errors || resObj.message || null;

        if (status === HttpStatus.BAD_REQUEST)
          code = ResponseCode.VALIDATION_ERROR;
        else if (status === HttpStatus.UNAUTHORIZED)
          code = ResponseCode.UNAUTHORIZED;
        else if (status === HttpStatus.FORBIDDEN) code = ResponseCode.FORBIDDEN;
        else if (status === HttpStatus.NOT_FOUND) code = ResponseCode.NOT_FOUND;
        else code = ResponseCode.BUSINESS_ERROR;
      }

      // Log HTTP exceptions (warnings for client errors, errors for server errors)
      if (status >= 500) {
        this.logger.error(
          `HTTP ${status} Error: ${message}`,
          exception.stack,
          {
            method: req.method,
            url: req.url,
            body: req.body,
            query: req.query,
            params: req.params,
            userId: (req as any).user?.id,
          },
        );
      } else {
        this.logger.warn(
          `HTTP ${status} Error: ${message}`,
          {
            method: req.method,
            url: req.url,
            body: req.body,
            query: req.query,
            params: req.params,
            userId: (req as any).user?.id,
          },
        );
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // Log all non-HTTP exceptions as errors
      this.logger.error(
        `Unhandled Exception: ${message}`,
        exception.stack,
        {
          method: req.method,
          url: req.url,
          body: req.body,
          query: req.query,
          params: req.params,
          userId: (req as any).user?.id,
          exceptionName: exception.constructor?.name,
        },
      );
    } else {
      // Log unknown error types
      this.logger.error(
        `Unknown Exception Type: ${String(exception)}`,
        JSON.stringify(exception, null, 2),
        {
          method: req.method,
          url: req.url,
          body: req.body,
          query: req.query,
          params: req.params,
          userId: (req as any).user?.id,
        },
      );
    }

    res.status(status).json(ResponseUtil.error(code, message, errors));
  }
}
