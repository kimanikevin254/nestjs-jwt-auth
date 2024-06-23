import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const status = exception.getStatus();
        
      // Get the error message from the response 
      const errorMessage = exception.getResponse()

      // Check if message is string or object
      // is string is the error is thrown from services
      // is object is the error comes from the validation pipes 
      const message = typeof errorMessage === 'string'
        ? errorMessage
        : typeof errorMessage === 'object' && 'message' in errorMessage
            ? errorMessage.message
            : 'An unexpected error occured'
  
      response
        .status(status)
        .json({
            error: {
                statusCode: status || 500,
                message
            }
        });
    }
  }
  