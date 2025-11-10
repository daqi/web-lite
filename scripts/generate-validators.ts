import fs from 'fs';
import path from 'path';
import { camelCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';

const schemaDir = path.join(__dirname, '../src/db/schema');
const outputDir = path.join(__dirname, '../src/validators');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function mapDrizzleTypeToValibot(col: any): string {
  const columnType = col.columnType;

  // 打印调试信息(可选)
  // console.log('Column info:', { name: col.name, columnType, length: col.length, notNull: col.notNull });

  if (!columnType) {
    console.warn(`⚠️  No columnType for ${col.name}`);
    return 'v.any()';
  }

  // 处理 Pg 前缀的类型
  const typeUpper = columnType.toUpperCase();

  // 处理 varchar/text
  if (typeUpper.includes('VARCHAR')) {
    const match = col.length;
    return match ? `v.pipe(v.string(), v.maxLength(${match}))` : 'v.string()';
  }

  if (typeUpper.includes('TEXT')) return 'v.string()';

  // 处理数字类型
  if (typeUpper.includes('SERIAL') || typeUpper.includes('INTEGER') || typeUpper.includes('INT'))
    return 'v.number()';
  if (typeUpper.includes('NUMERIC') || typeUpper.includes('DECIMAL'))
    return 'v.pipe(v.string(), v.decimal())';

  // 处理布尔和日期
  if (typeUpper.includes('BOOLEAN')) return 'v.boolean()';
  if (typeUpper.includes('TIMESTAMP') || typeUpper.includes('DATE'))
    return 'v.optional(v.pipe(v.string(), v.isoTimestamp()))';

  // 如果无法识别类型,打印警告
  console.warn(`⚠️  Unknown column type for ${col.name}: ${columnType}`);
  return 'v.any()';
}

function generateValidator(tableName: string, tableDef: any) {
  const fields: string[] = [];
  const updateFields: string[] = [];

  // 将表名转换为单数形式
  const singularName = pluralize.singular(tableName);

  // 从 Drizzle 表对象中获取列信息
  // 列信息存储在表对象的键中,每个键对应一个列
  const columns: Record<string, any> = {};

  for (const [key, value] of Object.entries(tableDef)) {
    if (typeof value === 'object' && value !== null && 'columnType' in value) {
      columns[key] = value;
    }
  }

  // 遍历所有列
  for (const [key, col] of Object.entries(columns)) {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'enableRLS') continue; // 跳过自动生成的字段

    const valibotType = mapDrizzleTypeToValibot(col);
    const isOptional = !(col as any).notNull;

    if (isOptional) {
      fields.push(`  ${key}: v.optional(${valibotType}),`);
      updateFields.push(`  ${key}: v.optional(${valibotType}),`);
    } else {
      fields.push(`  ${key}: ${valibotType},`);
      updateFields.push(`  ${key}: v.optional(${valibotType}),`);
    }
  }

  const content = `import * as v from 'valibot';

export const create${pascalCase(singularName)}Schema = v.object({
${fields.join('\n')}
});

export const update${pascalCase(singularName)}Schema = v.object({
${updateFields.join('\n')}
});

export type Create${pascalCase(singularName)}Input = v.InferOutput<typeof create${pascalCase(singularName)}Schema>;
export type Update${pascalCase(singularName)}Input = v.InferOutput<typeof update${pascalCase(singularName)}Schema>;
`;

  fs.writeFileSync(path.join(outputDir, `${camelCase(singularName)}.validator.ts`), content);
  console.log(`✅ Validator generated: ${singularName}`);
}

// 获取 schema 目录中的所有 .ts 文件(排除 index.ts)
async function loadSchemas() {
  const files = fs
    .readdirSync(schemaDir)
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts');

  const tables: Record<string, any> = {};

  for (const file of files) {
    const moduleName = file.replace('.ts', '');

    try {
      // 使用相对路径动态导入模块
      const module = await import(`../src/db/schema/${moduleName}`);

      // 查找导出的表定义
      for (const [exportName, exportValue] of Object.entries(module)) {
        // 检查是否是 Drizzle 表定义 (通过 Symbol 检查)
        if (exportValue && typeof exportValue === 'object') {
          const symbols = Object.getOwnPropertySymbols(exportValue);
          const hasTableSymbol = symbols.some((s) => s.toString().includes('IsDrizzleTable'));

          if (hasTableSymbol) {
            tables[exportName] = exportValue;
            console.log(`📦 Loaded table: ${exportName} from ${file}`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error);
    }
  }

  return tables;
}

// 获取现有的 validator 文件
function getExistingValidators(): Set<string> {
  if (!fs.existsSync(outputDir)) return new Set();

  return new Set(
    fs
      .readdirSync(outputDir)
      .filter((file) => file.endsWith('.validator.ts'))
      .map((file) => file.replace('.validator.ts', '')),
  );
}

// 主函数
async function main() {
  console.log('🔍 Scanning schema directory...\n');

  const tables = await loadSchemas();
  const tableNames = Object.keys(tables);

  if (tableNames.length === 0) {
    console.log('⚠️  No tables found in schema directory');
    return;
  }

  console.log(`\n📊 Found ${tableNames.length} table(s): ${tableNames.join(', ')}\n`);

  // 获取现有的 validators
  const existingValidators = getExistingValidators();
  const existingValidatorNames = Array.from(existingValidators);

  if (existingValidatorNames.length > 0) {
    console.log(`📝 Existing validators: ${existingValidatorNames.join(', ')}\n`);
  }

  // 生成所有 validators
  console.log('🔨 Generating validators...\n');
  for (const [tableName, tableDef] of Object.entries(tables)) {
    generateValidator(tableName, tableDef);
  }

  // 检查是否有多余的 validator 文件
  const tableNamesSet = new Set(tableNames.map((name) => camelCase(pluralize.singular(name))));
  const orphanedValidators = existingValidatorNames.filter((name) => !tableNamesSet.has(name));

  if (orphanedValidators.length > 0) {
    console.log(`\n⚠️  Found ${orphanedValidators.length} orphaned validator(s):`);
    orphanedValidators.forEach((name) => {
      console.log(`   • ${name}.validator.ts (no matching schema)`);
    });
    console.log('\n💡 Consider removing orphaned validators manually.');
  }

  console.log('\n🎉 All validators generated successfully!');
  console.log(`\n📈 Summary:`);
  console.log(`   • Tables found: ${tableNames.length}`);
  console.log(`   • Validators generated: ${tableNames.length}`);
  console.log(`   • Orphaned validators: ${orphanedValidators.length}`);
}

main().catch(console.error);
