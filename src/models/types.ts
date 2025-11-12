/**
 * 模型驱动代码生成系统 - 类型定义
 *
 * 通过定义模型配置，自动生成:
 * - Drizzle Schema
 * - Repository
 * - Service
 * - Route
 * - Validator
 */

// 字段类型定义
export type FieldType =
  | 'string'
  | 'text'
  | 'integer'
  | 'boolean'
  | 'timestamp'
  | 'decimal'
  | 'json'
  | 'uuid'
  | 'email';

// 字段验证规则
export interface FieldValidation {
  min?: number;
  max?: number;
  regex?: string;
  custom?: string; // 自定义验证函数名
}

// 字段定义
export interface FieldDefinition {
  name: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  default?: any;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  validation?: FieldValidation;
  description?: string;
  // 关系字段
  reference?: {
    table: string;
    field: string;
    onDelete?: 'cascade' | 'set null' | 'restrict';
  };
}

// 索引定义
export interface IndexDefinition {
  name: string;
  fields: string[];
  unique?: boolean;
}

// API 端点配置
export interface EndpointConfig {
  enabled: boolean;
  auth?: boolean; // 是否需要认证
  roles?: string[]; // 允许的角色
}

// API 配置
export interface ApiConfig {
  list?: EndpointConfig;
  get?: EndpointConfig;
  create?: EndpointConfig;
  update?: EndpointConfig;
  delete?: EndpointConfig;
  // 自定义端点
  custom?: {
    [key: string]: EndpointConfig & {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      path: string;
    };
  };
}

// 模型定义
export interface ModelDefinition {
  // 基本信息
  name: string; // 模型名称，如 "Product"
  tableName?: string; // 表名，默认为 name 的复数形式
  description?: string;

  // 字段定义
  fields: FieldDefinition[];

  // 索引
  indexes?: IndexDefinition[];

  // API 配置
  api?: ApiConfig;

  // 时间戳字段
  timestamps?: {
    createdAt?: boolean | string; // true 或自定义字段名
    updatedAt?: boolean | string;
  };

  // 软删除
  softDelete?: boolean | string; // true 或自定义字段名

  // 生成选项
  generate?: {
    schema?: boolean;
    repository?: boolean;
    service?: boolean;
    route?: boolean;
    validator?: boolean;
  };
}

// 默认的生成配置
export const DEFAULT_GENERATE_CONFIG = {
  schema: true,
  repository: true,
  service: true,
  route: true,
  validator: true,
};

// 默认的 API 配置
export const DEFAULT_API_CONFIG: ApiConfig = {
  list: { enabled: true, auth: false },
  get: { enabled: true, auth: false },
  create: { enabled: true, auth: false },
  update: { enabled: true, auth: false },
  delete: { enabled: true, auth: false },
};
