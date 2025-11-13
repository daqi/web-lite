/**
 * 标准响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

/**
 * 响应状态码枚举
 */
export enum ResponseCode {
  // 成功
  SUCCESS = 200,
  CREATED = 201,

  // 客户端错误
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  VALIDATION_ERROR = 422,

  // 服务器错误
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * 响应消息常量
 */
export const ResponseMessage = {
  SUCCESS: 'Success',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',

  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  CONFLICT: 'Conflict',
  VALIDATION_ERROR: 'Validation error',

  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service unavailable',
} as const; /**
 * 成功响应
 */
export function success<T = any>(
  data?: T,
  message: string = ResponseMessage.SUCCESS,
  code: number = ResponseCode.SUCCESS,
): ApiResponse<T> {
  return {
    code,
    message,
    data,
  };
}

/**
 * 创建成功响应
 */
export function created<T = any>(
  data?: T,
  message: string = ResponseMessage.CREATED,
): ApiResponse<T> {
  return {
    code: ResponseCode.CREATED,
    message,
    data,
  };
}

/**
 * 错误响应
 */
export function error(
  message: string,
  code: number = ResponseCode.BAD_REQUEST,
  data?: any,
): ApiResponse {
  return {
    code,
    message,
    data,
  };
}

/**
 * 未授权响应
 */
export function unauthorized(message: string = ResponseMessage.UNAUTHORIZED): ApiResponse {
  return {
    code: ResponseCode.UNAUTHORIZED,
    message,
  };
}

/**
 * 禁止访问响应
 */
export function forbidden(message: string = ResponseMessage.FORBIDDEN): ApiResponse {
  return {
    code: ResponseCode.FORBIDDEN,
    message,
  };
}

/**
 * 资源未找到响应
 */
export function notFound(message: string = ResponseMessage.NOT_FOUND): ApiResponse {
  return {
    code: ResponseCode.NOT_FOUND,
    message,
  };
}

/**
 * 数据验证失败响应
 */
export function validationError(
  message: string = ResponseMessage.VALIDATION_ERROR,
  data?: any,
): ApiResponse {
  return {
    code: ResponseCode.VALIDATION_ERROR,
    message,
    data,
  };
}

/**
 * 服务器错误响应
 */
export function internalError(message: string = ResponseMessage.INTERNAL_ERROR): ApiResponse {
  return {
    code: ResponseCode.INTERNAL_ERROR,
    message,
  };
}
