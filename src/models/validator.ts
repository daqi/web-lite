/**
 * 模型定义验证器
 * 使用 Ajv 验证 JSON Schema
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import type { ModelDefinition } from './types';

// 读取 JSON Schema
const schemaPath = path.join(__dirname, 'schema.json');
const modelSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

// 创建 Ajv 实例
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  useDefaults: true, // 自动应用默认值
});

// 添加格式验证（email, url 等）
addFormats(ajv);

// 编译 Schema
const validate = ajv.compile(modelSchema);

/**
 * 验证模型定义
 */
export function validateModel(model: any): {
  valid: boolean;
  errors?: string[];
  model?: ModelDefinition;
} {
  // 深拷贝避免修改原对象
  const modelCopy = JSON.parse(JSON.stringify(model));

  const valid = validate(modelCopy);

  if (!valid && validate.errors) {
    const errors = validate.errors.map((err) => {
      const path = err.instancePath || 'root';
      return `${path}: ${err.message}`;
    });
    return { valid: false, errors };
  }

  return { valid: true, model: modelCopy as ModelDefinition };
}

/**
 * 应用默认值到模型定义
 */
export function applyDefaults(model: Partial<ModelDefinition>): ModelDefinition {
  const defaults = {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
    softDelete: false,
    api: {
      list: { enabled: true, auth: false },
      get: { enabled: true, auth: false },
      create: { enabled: true, auth: true },
      update: { enabled: true, auth: true },
      delete: { enabled: true, auth: true },
    },
    generate: {
      schema: true,
      repository: true,
      service: true,
      route: true,
      validator: true,
    },
  };

  return {
    ...defaults,
    ...model,
    timestamps: {
      ...defaults.timestamps,
      ...model.timestamps,
    },
    api: {
      list: { ...defaults.api.list, ...model.api?.list },
      get: { ...defaults.api.get, ...model.api?.get },
      create: { ...defaults.api.create, ...model.api?.create },
      update: { ...defaults.api.update, ...model.api?.update },
      delete: { ...defaults.api.delete, ...model.api?.delete },
    },
    generate: {
      ...defaults.generate,
      ...model.generate,
    },
  } as ModelDefinition;
}

/**
 * 从 JSON 文件加载并验证模型
 */
export function loadAndValidateModel(filePath: string): {
  valid: boolean;
  errors?: string[];
  model?: ModelDefinition;
} {
  try {
    const ext = path.extname(filePath);

    // 仅支持 JSON 文件
    if (ext !== '.json') {
      return {
        valid: false,
        errors: ['Only JSON model files (.model.json) are supported'],
      };
    }

    // 读取并解析 JSON 文件
    const content = fs.readFileSync(filePath, 'utf-8');
    const modelData = JSON.parse(content);

    // 应用默认值
    const modelWithDefaults = applyDefaults(modelData);

    // 验证
    return validateModel(modelWithDefaults);
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
