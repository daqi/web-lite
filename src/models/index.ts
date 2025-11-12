/**
 * 模型定义导出
 *
 * 支持两种方式:
 * 1. 约定式：自动扫描 src/models/*.model.json (推荐)
 * 2. 配置式：选择性加载指定模型
 */

export * from './types';
export * from './loader';

// ========== 约定式加载（推荐） ==========
// 自动扫描并加载所有 *.model.json 文件
import { loadModelsSync } from './loader';
import { ModelDefinition } from './types';

// 方式一：约定式 - 自动加载所有模型
export const models: Record<string, ModelDefinition> = loadModelsSync();

// 方式二：配置式 - 只加载指定的模型（取消下面的注释并注释上面的代码）
// export const models: Record<string, ModelDefinition> = loadModelsSync({
//   category: true,
//   product: true,
//   // 只加载这里列出的模型
// });

// 模型列表（用于遍历）
export const modelList = Object.values(models);

// 导出模型名称列表
export const modelNames = Object.keys(models);
