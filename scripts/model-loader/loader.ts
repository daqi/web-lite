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
 * 配置式模型选项
 * 示例: { category: true, product: true }
 */
export type ModelConfig = Record<string, boolean>;

/**
 * 同步方式加载 JSON 模型（用于非 ESM 环境）
 * 会自动读取 src/models/index.json 配置文件
 * 只加载配置中值为 true 的模型
 */
export function loadModelsSync(): Record<string, ModelDefinition> {
  const modelsDir = path.join(__dirname, '../../src/models');
  const models: Record<string, ModelDefinition> = {};

  try {
    // 读取配置文件
    let config: ModelConfig | undefined;
    const configPath = path.join(modelsDir, 'index.json');

    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configContent);
    }

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
          if (config && config[modelKey] === true) {
            models[modelKey] = model;
          } else if (!config) {
            // 如果没有配置文件，则加载所有模型（向后兼容）
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
