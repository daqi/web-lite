import { Context, Next } from 'hono';
import { ApiResponse, ResponseCode } from '../utils/response';

/**
 * 扩展 Hono Context，添加统一响应方法
 */
declare module 'hono' {
  interface Context {
    apiSuccess: <T = any>(data?: T, message?: string) => Response;
    apiCreated: <T = any>(data?: T, message?: string) => Response;
    apiError: (message: string, code?: number, data?: any) => Response;
    apiUnauthorized: (message?: string) => Response;
    apiForbidden: (message?: string) => Response;
    apiNotFound: (message?: string) => Response;
    apiValidationError: (message?: string, data?: any) => Response;
  }
}

/**
 * 响应中间件
 * 为 Context 添加统一的响应方法
 */
export const responseMiddleware = async (c: Context, next: Next) => {
  // 成功响应
  c.apiSuccess = <T = any>(data?: T, message: string = 'Success') => {
    const response: ApiResponse<T> = {
      code: ResponseCode.SUCCESS,
      message,
      data,
    };
    return c.json(response, 200);
  };

  // 创建成功响应
  c.apiCreated = <T = any>(data?: T, message: string = 'Created successfully') => {
    const response: ApiResponse<T> = {
      code: ResponseCode.CREATED,
      message,
      data,
    };
    return c.json(response, 201);
  };

  // 错误响应
  c.apiError = (message: string, code: number = ResponseCode.BAD_REQUEST, data?: any) => {
    const response: ApiResponse = {
      code,
      message,
      data,
    };
    const httpStatus = code >= 200 && code < 600 ? code : 400;
    return c.json(response, httpStatus as any);
  };

  // 未授权响应
  c.apiUnauthorized = (message: string = 'Unauthorized') => {
    const response: ApiResponse = {
      code: ResponseCode.UNAUTHORIZED,
      message,
    };
    return c.json(response, 401);
  };

  // 禁止访问响应
  c.apiForbidden = (message: string = 'Forbidden') => {
    const response: ApiResponse = {
      code: ResponseCode.FORBIDDEN,
      message,
    };
    return c.json(response, 403);
  };

  // 资源未找到响应
  c.apiNotFound = (message: string = 'Not found') => {
    const response: ApiResponse = {
      code: ResponseCode.NOT_FOUND,
      message,
    };
    return c.json(response, 404);
  };

  // 数据验证失败响应
  c.apiValidationError = (message: string = 'Validation error', data?: any) => {
    const response: ApiResponse = {
      code: ResponseCode.VALIDATION_ERROR,
      message,
      data,
    };
    return c.json(response, 422);
  };

  await next();
};
