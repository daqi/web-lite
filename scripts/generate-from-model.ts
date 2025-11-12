/**
 * 从模型定义生成所有代码
 *
 * 使用方式:
 * pnpm run generate:model <modelName>
 *
 * 例如:
 * pnpm run generate:model product
 */

import fs from 'fs';
import path from 'path';
import {
  generateSchema,
  generateValidator,
  generateRepository,
  generateService,
  generateRoute,
  generateModuleIndex,
} from './model-generator';
import { models } from '../src/models';
import { snakeCase } from 'change-case';
import { scanRoutes, updateRouterFile, scanSchemas, updateSchemaIndex } from './route-register';

const modelName = process.argv[2];

if (!modelName) {
  console.error('❌ 请提供模型名称');
  console.log('使用方式: pnpm run generate:model <modelName>');
  console.log('可用的模型:', Object.keys(models).join(', '));
  process.exit(1);
}

const model = models[modelName as keyof typeof models];

if (!model) {
  console.error(`❌ 找不到模型: ${modelName}`);
  console.log('可用的模型:', Object.keys(models).join(', '));
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const generateConfig = model.generate || {
  schema: true,
  repository: true,
  service: true,
  route: true,
  validator: true,
};

console.log(`\n🚀 开始生成 ${model.name} 模型的代码...\n`);

// 确保目录存在
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

try {
  // 1. 生成 Schema
  if (generateConfig.schema) {
    const schemaDir = path.join(rootDir, 'src/db/schema');
    ensureDir(schemaDir);

    const schemaFile = path.join(schemaDir, `${snakeCase(model.name)}.ts`);
    const schemaCode = generateSchema(model);
    fs.writeFileSync(schemaFile, schemaCode);
    console.log(`✅ Schema: src/db/schema/${snakeCase(model.name)}.ts`);
  }

  // 2. 生成 Validator
  if (generateConfig.validator) {
    const validatorDir = path.join(rootDir, 'src/validators');
    ensureDir(validatorDir);

    const validatorFile = path.join(validatorDir, `${snakeCase(model.name)}.validator.ts`);
    const validatorCode = generateValidator(model);
    fs.writeFileSync(validatorFile, validatorCode);
    console.log(`✅ Validator: src/validators/${snakeCase(model.name)}.validator.ts`);
  }

  // 3. 生成 Repository
  if (generateConfig.repository) {
    const moduleDir = path.join(rootDir, 'src/modules', snakeCase(model.name));
    ensureDir(moduleDir);

    const repoFile = path.join(moduleDir, `${snakeCase(model.name)}.repository.ts`);
    const repoCode = generateRepository(model);
    fs.writeFileSync(repoFile, repoCode);
    console.log(
      `✅ Repository: src/modules/${snakeCase(model.name)}/${snakeCase(model.name)}.repository.ts`,
    );
  }

  // 4. 生成 Service
  if (generateConfig.service) {
    const moduleDir = path.join(rootDir, 'src/modules', snakeCase(model.name));
    ensureDir(moduleDir);

    const serviceFile = path.join(moduleDir, `${snakeCase(model.name)}.service.ts`);
    const serviceCode = generateService(model);
    fs.writeFileSync(serviceFile, serviceCode);
    console.log(
      `✅ Service: src/modules/${snakeCase(model.name)}/${snakeCase(model.name)}.service.ts`,
    );
  }

  // 5. 生成 Route
  if (generateConfig.route) {
    const moduleDir = path.join(rootDir, 'src/modules', snakeCase(model.name));
    ensureDir(moduleDir);

    const routeFile = path.join(moduleDir, `${snakeCase(model.name)}.route.ts`);
    const routeCode = generateRoute(model);
    fs.writeFileSync(routeFile, routeCode);
    console.log(`✅ Route: src/modules/${snakeCase(model.name)}/${snakeCase(model.name)}.route.ts`);
  }

  // 6. 生成模块 index.ts
  const moduleDir = path.join(rootDir, 'src/modules', snakeCase(model.name));
  const indexFile = path.join(moduleDir, 'index.ts');
  const indexCode = generateModuleIndex(model);
  fs.writeFileSync(indexFile, indexCode);
  console.log(`✅ Index: src/modules/${snakeCase(model.name)}/index.ts`);

  console.log(`\n✨ ${model.name} 模型代码生成完成!\n`);

  // 7. 自动注册到 schema/index.ts
  console.log('🔄 正在自动注册...\n');

  const schemaDir = path.join(rootDir, 'src/db/schema');
  const schemaIndexPath = path.join(schemaDir, 'index.ts');
  const schemas = scanSchemas(schemaDir);
  updateSchemaIndex(schemaIndexPath, schemas);

  // 8. 自动注册到 router.ts
  const modulesDir = path.join(rootDir, 'src/modules');
  const routerFilePath = path.join(rootDir, 'src/router.ts');
  const routes = scanRoutes(modulesDir);
  updateRouterFile(routerFilePath, routes);

  console.log('\n✅ 全部完成！\n');
  console.log('📝 下一步:');
  console.log(`1. 运行 pnpm run db:push 更新数据库`);
  console.log(`2. 重启开发服务器查看效果\n`);
} catch (error) {
  console.error('❌ 生成失败:', error);
  process.exit(1);
}
