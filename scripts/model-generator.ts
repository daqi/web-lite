/**
 * 模型驱动代码生成器
 *
 * 从模型定义生成代码
 */

import { ModelDefinition, FieldDefinition } from './model-loader/types';
import pluralize from 'pluralize';
import { pascalCase, camelCase, snakeCase } from 'change-case';

/**
 * 字段类型映射到 Drizzle 类型
 */
const fieldTypeToDrizzle = (field: FieldDefinition): string => {
  const { type, required, unique, default: defaultValue, primaryKey, autoIncrement } = field;

  // 将字段名转换为 snake_case（数据库列名）
  const dbFieldName = snakeCase(field.name);

  let drizzleType = '';

  switch (type) {
    case 'string':
      const length = field.length || 255;
      drizzleType = `varchar('${dbFieldName}', { length: ${length} })`;
      break;
    case 'text':
      drizzleType = `text('${dbFieldName}')`;
      break;
    case 'integer':
      drizzleType = `integer('${dbFieldName}')`;
      break;
    case 'boolean':
      drizzleType = `boolean('${dbFieldName}')`;
      break;
    case 'timestamp':
      drizzleType = `timestamp('${dbFieldName}')`;
      break;
    case 'decimal':
      const precision = field.precision || 10;
      const scale = field.scale || 2;
      drizzleType = `decimal('${dbFieldName}', { precision: ${precision}, scale: ${scale} })`;
      break;
    case 'json':
      drizzleType = `jsonb('${dbFieldName}')`;
      break;
    case 'uuid':
      drizzleType = `uuid('${dbFieldName}')`;
      break;
    case 'email':
      drizzleType = `varchar('${dbFieldName}', { length: 255 })`;
      break;
    default:
      drizzleType = `varchar('${dbFieldName}', { length: 255 })`;
  }

  // 添加修饰符
  const modifiers: string[] = [];

  if (primaryKey) {
    modifiers.push('primaryKey()');
  }

  if (autoIncrement && type === 'integer') {
    // PostgreSQL 使用 serial
    return `serial('${dbFieldName}').primaryKey()`;
  }

  if (required && !primaryKey) {
    modifiers.push('notNull()');
  }

  if (unique) {
    modifiers.push('unique()');
  }

  if (defaultValue !== undefined) {
    const defaultStr =
      typeof defaultValue === 'string' ? `'${defaultValue}'` : JSON.stringify(defaultValue);
    modifiers.push(`default(${defaultStr})`);
  }

  if (type === 'timestamp' && (field.name === 'createdAt' || field.name === 'updatedAt')) {
    modifiers.push('defaultNow()');
  }

  return `${drizzleType}${modifiers.length > 0 ? '.' + modifiers.join('.') : ''}`;
};

/**
 * 生成 Drizzle Schema
 */
export const generateSchema = (model: ModelDefinition): string => {
  const tableName = model.tableName || pluralize.singular(snakeCase(model.name));
  const modelName = camelCase(model.name);

  // 添加时间戳字段
  const fields = [...model.fields];

  if (model.timestamps?.createdAt) {
    const fieldName =
      typeof model.timestamps.createdAt === 'string' ? model.timestamps.createdAt : 'createdAt';
    fields.push({
      name: fieldName,
      type: 'timestamp',
      required: true,
      description: '创建时间',
    });
  }

  if (model.timestamps?.updatedAt) {
    const fieldName =
      typeof model.timestamps.updatedAt === 'string' ? model.timestamps.updatedAt : 'updatedAt';
    fields.push({
      name: fieldName,
      type: 'timestamp',
      required: true,
      description: '更新时间',
    });
  }

  if (model.softDelete) {
    const fieldName = typeof model.softDelete === 'string' ? model.softDelete : 'deletedAt';
    fields.push({
      name: fieldName,
      type: 'timestamp',
      required: false,
      description: '软删除时间',
    });
  }

  // 生成字段定义
  const fieldDefinitions = fields
    .map((field) => {
      const comment = field.description ? `  // ${field.description}` : '';
      return `  ${field.name}: ${fieldTypeToDrizzle(field)},${comment}`;
    })
    .join('\n');

  // 收集需要导入的引用表
  const referencedTables = fields
    .filter((field) => field.reference)
    .map((field) => {
      const refTablePlural = field.reference!.table;
      const refTableSingular = pluralize.singular(refTablePlural);
      return camelCase(refTableSingular);
    })
    .filter((refTable) => refTable !== modelName); // 排除自引用

  // 去重
  const uniqueReferencedTables = [...new Set(referencedTables)];

  // 生成引用关系
  const relations = fields
    .filter((field) => field.reference)
    .map((field) => {
      // 将表名转换为单数形式的 camelCase（如 categories -> category）
      const refTablePlural = field.reference!.table;
      const refTableSingular = pluralize.singular(refTablePlural);
      const refTable = camelCase(refTableSingular);
      const refField = field.reference!.field;
      return `  ${field.name}Relation: one(${refTable}, {
    fields: [${modelName}.${field.name}],
    references: [${refTable}.${refField}],
  }),`;
    })
    .join('\n');

  const relationsBlock = relations
    ? `

export const ${modelName}Relations = relations(${modelName}, ({ one }) => ({
${relations}
}));`
    : '';

  // 生成导入语句
  const imports =
    uniqueReferencedTables.length > 0
      ? uniqueReferencedTables
          .map((table) => {
            const fileName = snakeCase(table);
            return `import { ${table} } from './${fileName}';`;
          })
          .join('\n')
      : '';

  return `import { pgTable, serial, varchar, text, integer, boolean, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';
${relations ? `import { relations } from 'drizzle-orm';` : ''}
${imports}

/**
 * ${model.description || model.name}
 */
export const ${modelName} = pgTable('${tableName}', {
${fieldDefinitions}
});

export type ${pascalCase(model.name)} = typeof ${modelName}.$inferSelect;
export type New${pascalCase(model.name)} = typeof ${modelName}.$inferInsert;${relationsBlock}
`;
};

/**
 * 字段类型映射到 Valibot schema
 */
const fieldTypeToValibot = (field: FieldDefinition): string => {
  const { type, required, validation } = field;

  let valibotType = '';

  switch (type) {
    case 'string':
    case 'text':
    case 'email':
      valibotType = 'v.string()';

      // email 类型或 email 验证
      if (type === 'email' || validation?.email) {
        valibotType = 'v.pipe(v.string(), v.email())';
      }
      // url 验证
      else if (validation?.url) {
        valibotType = 'v.pipe(v.string(), v.url())';
      }
      // enum 验证（优先级高）
      else if (validation?.enum && validation.enum.length > 0) {
        const enumValues = validation.enum
          .map((v) => (typeof v === 'string' ? `'${v}'` : v))
          .join(', ');
        valibotType = `v.picklist([${enumValues}])`;
      }
      // regex 验证
      else if (validation?.regex || validation?.pattern) {
        const regex = validation.regex || validation.pattern;
        valibotType = `v.pipe(v.string(), v.regex(/${regex}/))`;
      }
      // 长度验证
      else if (validation?.min !== undefined || validation?.max !== undefined) {
        const constraints: string[] = [];
        if (validation.min !== undefined) {
          constraints.push(`v.minLength(${validation.min})`);
        }
        if (validation.max !== undefined) {
          constraints.push(`v.maxLength(${validation.max})`);
        }
        valibotType = `v.pipe(v.string(), ${constraints.join(', ')})`;
      }
      break;
    case 'integer':
      valibotType = 'v.number()';
      if (validation?.min !== undefined || validation?.max !== undefined) {
        const constraints: string[] = [];
        if (validation.min !== undefined) {
          constraints.push(`v.minValue(${validation.min})`);
        }
        if (validation.max !== undefined) {
          constraints.push(`v.maxValue(${validation.max})`);
        }
        valibotType = `v.pipe(v.number(), ${constraints.join(', ')})`;
      }
      break;
    case 'boolean':
      valibotType = 'v.boolean()';
      break;
    case 'timestamp':
      valibotType = 'v.pipe(v.string(), v.isoTimestamp())';
      break;
    case 'decimal':
      // decimal 在数据库中存储为 string，需要验证数字格式
      // 根据 scale 生成对应的正则表达式
      const scale = field.scale || 2;
      valibotType = `v.pipe(v.string(), v.regex(/^\\d+(\\.\\d{1,${scale}})?$/))`;
      break;
    case 'json':
      valibotType = 'v.any()';
      break;
    case 'uuid':
      valibotType = 'v.pipe(v.string(), v.uuid())';
      break;
    default:
      valibotType = 'v.string()';
  }

  return required ? valibotType : `v.optional(${valibotType})`;
};

/**
 * 生成 Valibot Validator
 */
export const generateValidator = (model: ModelDefinition): string => {
  const modelName = pascalCase(model.name);

  // 过滤掉自动生成的字段
  const createFields = model.fields.filter(
    (field: FieldDefinition) => !field.primaryKey && !field.autoIncrement,
  );

  const updateFields = model.fields.filter(
    (field: FieldDefinition) => !field.primaryKey && !field.autoIncrement,
  );

  const createFieldsDefinition = createFields
    .map((field: FieldDefinition) => {
      return `  ${field.name}: ${fieldTypeToValibot(field)},`;
    })
    .join('\n');

  const updateFieldsDefinition = updateFields
    .map((field: FieldDefinition) => {
      const valibotType = fieldTypeToValibot(field);
      // 更新时所有字段都是可选的
      const optionalType = valibotType.startsWith('v.optional')
        ? valibotType
        : `v.optional(${valibotType})`;
      return `  ${field.name}: ${optionalType},`;
    })
    .join('\n');

  return `import * as v from 'valibot';

/**
 * ${model.description || model.name} Validators
 * Auto-generated from model definition
 */

// 创建 ${modelName} 验证器
export const create${modelName}Schema = v.object({
${createFieldsDefinition}
});

// 更新 ${modelName} 验证器
export const update${modelName}Schema = v.object({
${updateFieldsDefinition}
});

export type Create${modelName}Input = v.InferInput<typeof create${modelName}Schema>;
export type Update${modelName}Input = v.InferInput<typeof update${modelName}Schema>;
`;
};

/**
 * 生成 Repository
 */
export const generateRepository = (model: ModelDefinition): string => {
  const modelName = pascalCase(model.name);
  const tableName = camelCase(model.name);

  return `import { db } from '../../db/client';
import { ${tableName}, type ${modelName}, type New${modelName} } from '../../db/schema/${snakeCase(model.name)}';
import { eq } from 'drizzle-orm';

/**
 * ${model.description || modelName} Repository
 * Auto-generated from model definition
 */
export class ${modelName}Repository {
  async findAll(): Promise<${modelName}[]> {
    return db.select().from(${tableName});
  }

  async findById(id: number): Promise<${modelName} | undefined> {
    const result = await db.select().from(${tableName}).where(eq(${tableName}.id, id));
    return result[0];
  }

  async create(data: New${modelName}): Promise<${modelName}> {
    const result = await db.insert(${tableName}).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<New${modelName}>): Promise<${modelName} | undefined> {
    const result = await db
      .update(${tableName})
      .set({ ...data, updatedAt: new Date() })
      .where(eq(${tableName}.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
${
  model.softDelete
    ? `    // 软删除
    const result = await db
      .update(${tableName})
      .set({ ${typeof model.softDelete === 'string' ? model.softDelete : 'deletedAt'}: new Date() })
      .where(eq(${tableName}.id, id))
      .returning();
    return result.length > 0;`
    : `    // 硬删除
    const result = await db.delete(${tableName}).where(eq(${tableName}.id, id)).returning();
    return result.length > 0;`
}
  }
}
`;
};

/**
 * 生成 Service
 */
export const generateService = (model: ModelDefinition): string => {
  const modelName = pascalCase(model.name);
  const repoVar = camelCase(model.name) + 'Repository';

  return `import { ${modelName}Repository } from './${snakeCase(model.name)}.repository';
import type { ${modelName}, New${modelName} } from '../../db/schema/${snakeCase(model.name)}';

/**
 * ${model.description || modelName} Service
 * Auto-generated from model definition
 */
export class ${modelName}Service {
  private ${repoVar}: ${modelName}Repository;

  constructor() {
    this.${repoVar} = new ${modelName}Repository();
  }

  async getAll(): Promise<${modelName}[]> {
    return this.${repoVar}.findAll();
  }

  async getById(id: number): Promise<${modelName} | undefined> {
    return this.${repoVar}.findById(id);
  }

  async create(data: New${modelName}): Promise<${modelName}> {
    return this.${repoVar}.create(data);
  }

  async update(id: number, data: Partial<New${modelName}>): Promise<${modelName} | undefined> {
    return this.${repoVar}.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.${repoVar}.delete(id);
  }
}
`;
};

/**
 * 生成 Route
 */
export const generateRoute = (model: ModelDefinition): string => {
  const modelName = pascalCase(model.name);
  const serviceName = camelCase(model.name) + 'Service';
  const routePath = snakeCase(model.name);

  const api = model.api || {};

  const routes: string[] = [];

  // List route
  if (api.list?.enabled !== false) {
    routes.push(`
// 获取所有${model.description || modelName}
app.get('/', async (c) => {
  const items = await ${serviceName}.getAll();
  return c.apiSuccess(items);
});`);
  }

  // Get route
  if (api.get?.enabled !== false) {
    routes.push(`
// 获取单个${model.description || modelName}
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const item = await ${serviceName}.getById(id);

  if (!item) {
    return c.apiNotFound('${modelName} not found');
  }

  return c.apiSuccess(item);
});`);
  }

  // Create route
  if (api.create?.enabled !== false) {
    routes.push(`
// 创建${model.description || modelName}
app.post('/', vValidator('json', create${modelName}Schema), async (c) => {
  const data = c.req.valid('json');
  const item = await ${serviceName}.create(data);
  return c.apiCreated(item);
});`);
  }

  // Update route
  if (api.update?.enabled !== false) {
    routes.push(`
// 更新${model.description || modelName}
app.put('/:id', vValidator('json', update${modelName}Schema), async (c) => {
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');
  const item = await ${serviceName}.update(id, data);

  if (!item) {
    return c.apiNotFound('${modelName} not found');
  }

  return c.apiSuccess(item);
});`);
  }

  // Delete route
  if (api.delete?.enabled !== false) {
    routes.push(`
// 删除${model.description || modelName}
app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const success = await ${serviceName}.delete(id);

  if (!success) {
    return c.apiNotFound('${modelName} not found');
  }

  return c.apiSuccess(null, 'Deleted successfully');
});`);
  }

  return `import { Hono } from 'hono';
import { vValidator } from '@hono/valibot-validator';
import { ${modelName}Service } from './${routePath}.service';
import { create${modelName}Schema, update${modelName}Schema } from '../../validators/${routePath}.validator';

/**
 * ${model.description || modelName} Routes
 * Auto-generated from model definition
 */
const app = new Hono();
const ${serviceName} = new ${modelName}Service();
${routes.join('\n')}

export const ${camelCase(model.name)}Route = app;
`;
};

/**
 * 生成模块 index.ts
 */
export const generateModuleIndex = (model: ModelDefinition): string => {
  const routePath = snakeCase(model.name);

  return `export * from './${routePath}.repository';
export * from './${routePath}.service';
export * from './${routePath}.route';
`;
};
