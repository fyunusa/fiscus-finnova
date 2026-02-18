import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { generateErrorResponse } from './response.helper';

export function handleStandardException(
  error: any,
  fallbackMessage: string,
): never {
  if (
    error instanceof ForbiddenException ||
    error instanceof UnauthorizedException ||
    error instanceof NotFoundException ||
    error instanceof BadRequestException ||
    error instanceof ConflictException ||
    error instanceof InternalServerErrorException
  ) {
    throw error;
  }

  const errorMessage = error?.message || fallbackMessage;
  throw new BadRequestException(generateErrorResponse(fallbackMessage, errorMessage));
}

export function handleAsyncException(
  error: any,
  fallbackMessage: string,
): ResponseDto {
  if (
    error instanceof ForbiddenException ||
    error instanceof UnauthorizedException ||
    error instanceof NotFoundException ||
    error instanceof BadRequestException ||
    error instanceof ConflictException
  ) {
    return generateErrorResponse(fallbackMessage, error.message);
  }

  return generateErrorResponse(fallbackMessage, error?.message);
}

interface ResponseDto {
  success: boolean;
  message: string;
  error?: string;
  timestamp?: Date;
}
