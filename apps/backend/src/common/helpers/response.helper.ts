import { ResponseDto } from '../dtos/response.dto';

export function generateSuccessResponse<T>(
  messageKey: string,
  data?: T,
): ResponseDto<T> {
  return {
    success: true,
    message: messageKey,
    data,
    timestamp: new Date(),
  };
}

export function generateErrorResponse(messageKey: string, error?: string): ResponseDto {
  return {
    success: false,
    message: messageKey,
    error,
    timestamp: new Date(),
  };
}

export function generatePaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Data retrieved successfully',
): ResponseDto<{ items: T[]; total: number; page: number; limit: number; pages: number }> {
  return {
    success: true,
    message,
    data: {
      items: data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    timestamp: new Date(),
  };
}
