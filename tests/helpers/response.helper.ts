/**
 * 测试辅助工具
 * 用于处理新的 API 响应格式
 */

import { expect } from 'vitest';

/**
 * 解析 API 响应
 * 从标准响应格式中提取数据
 */
export function parseApiResponse<T = any>(
  response: any,
): {
  code: number;
  message: string;
  data: T | undefined;
} {
  return {
    code: response.code,
    message: response.message,
    data: response.data,
  };
}

/**
 * 获取响应数据
 * 直接返回 data 字段
 */
export function getResponseData<T = any>(response: any): T | undefined {
  if (response.code >= 400) console.log('API Response:', response);
  return response.data;
}

/**
 * 检查响应是否成功
 */
export function isSuccessResponse(response: any): boolean {
  return response.code === 200 || response.code === 201;
}

/**
 * 检查响应是否为错误
 */
export function isErrorResponse(response: any): boolean {
  return response.code >= 400;
}

/**
 * 断言响应成功
 */
export function expectSuccess(response: any, expectedCode: number = 200) {
  if (expectedCode === 201) {
    expect(response.code).toBe(201);
  } else {
    expect(response.code).toBe(200);
  }
  expect(response.message).toBeTruthy();
}

/**
 * 断言响应错误
 */
export function expectError(response: any, expectedCode: number) {
  expect(response.code).toBe(expectedCode);
  expect(response.message).toBeTruthy();
}
