/**
 * 模型加载器 - 仅支持 JSON 格式
 *
 * 约定式：自动扫描 src/models/*.model.json 文件
 * 配置式：手动在 index.ts 中注册
 */

import fs from 'fs';
import path from 'path';
import type { ModelDefinition } from './types';
import { applyDefaults, validateModel } from './validator';

/**
 * 自动扫描并加载所有 JSON 模型文件
 */
export async function loadModelsFromFiles(): Promise<Record<string, ModelDefinition>> {
  const modelsDir = __dirname;
  const models: Record<string, ModelDefinition> = {};

  try {
    const files = fs.readdirSync(modelsDir);

    // 仅加载 .model.json 文件
    const modelFiles = files.filter((file) => file.endsWith('.model.json'));

    for (const file of modelFiles) {
      const filePath = path.join(modelsDir, file);

      try {
        // 读取并解析 JSON 文件
        const content = fs.readFileSync(filePath, 'utf-8');
        const modelData = JSON.parse(content);

        // 应用默认值
        const modelWithDefaults = applyDefaults(modelData);

        // 验证模型
        const { valid, errors, model } = validateModel(modelWithDefaults);

        if (!valid) {
          console.warn(`⚠ 跳过无效模型 ${file}:`, errors);
          continue;
        }

        if (model) {
          // 使用模型名称的小写作为 key
          const modelKey = model.name.toLowerCase();
          models[modelKey] = model;

          console.log(`✓ 加载模型: ${model.name} (from ${file})`);
        }
      } catch (error) {
        console.warn(`⚠ 跳过文件 ${file}:`, error);
      }
    }

    console.log(`\n共加载 ${Object.keys(models).length} 个模型\n`);
    return models;
  } catch (error) {
    console.error('模型加载失败:', error);
    return {};
  }
}

/**
 * 配置式模型选项
 * 示例: { category: true, product: true }
 */
export type ModelConfig = Record<string, boolean>;

/**
 * 同步方式加载 JSON 模型（用于非 ESM 环境）
 * @param config 可选的模型配置，格式: { modelName: true }
 *               如果不传参数，则自动加载所有模型（约定式）
 *               如果传入配置，则只加载配置中值为 true 的模型（配置式）
 */
export function loadModelsSync(config?: ModelConfig): Record<string, ModelDefinition> {
  const modelsDir = __dirname;
  const models: Record<string, ModelDefinition> = {};

  try {
    const files = fs.readdirSync(modelsDir);

    // 仅加载 .model.json 文件
    const modelFiles = files.filter((file) => file.endsWith('.model.json'));

    for (const file of modelFiles) {
      const filePath = path.join(modelsDir, file);

      try {
        // 读取并解析 JSON 文件
        const content = fs.readFileSync(filePath, 'utf-8');
        const modelData = JSON.parse(content);

        // 应用默认值
        const modelWithDefaults = applyDefaults(modelData);

        // 验证模型
        const { valid, errors, model } = validateModel(modelWithDefaults);

        if (!valid) {
          continue; // 静默跳过无效模型
        }

        if (model) {
          const modelKey = model.name.toLowerCase();

          // 配置式：检查是否在配置中启用
          if (config) {
            // 只加载配置中明确设置为 true 的模型
            if (config[modelKey] === true) {
              models[modelKey] = model;
            }
          } else {
            // 约定式：加载所有模型
            models[modelKey] = model;
          }
        }
      } catch (error) {
        // 静默跳过
      }
    }

    return models;
  } catch (error) {
    console.error('模型加载失败:', error);
    return {};
  }
}
