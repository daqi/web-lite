/**
 * 路由自动注册工具
 *
 * 支持约定式路由注册
 */

import fs from 'fs';
import path from 'path';
import pluralize from 'pluralize';
import { camelCase, snakeCase } from 'change-case';

interface RouteInfo {
  moduleName: string;
  routePath: string;
  importName: string;
  filePath: string;
}

/**
 * 扫描 modules 目录，找到所有路由
 */
export function scanRoutes(modulesDir: string): RouteInfo[] {
  const routes: RouteInfo[] = [];

  try {
    if (!fs.existsSync(modulesDir)) {
      return routes;
    }

    const modules = fs.readdirSync(modulesDir);

    for (const moduleName of modules) {
      const modulePath = path.join(modulesDir, moduleName);
      const stat = fs.statSync(modulePath);

      if (stat.isDirectory()) {
        // 检查是否存在 route 文件
        const routeFile = `${moduleName}.route.ts`;
        const routeFilePath = path.join(modulePath, routeFile);

        if (fs.existsSync(routeFilePath)) {
          // 特殊规则：auth 等模块不需要转复数
          const specialModules = ['auth'];
          const routePath = specialModules.includes(moduleName)
            ? `/${snakeCase(moduleName)}`
            : `/${pluralize(snakeCase(moduleName))}`;

          routes.push({
            moduleName,
            routePath, // RESTful 风格使用复数，但特殊模块除外
            importName: `${camelCase(moduleName)}Route`,
            filePath: `./modules/${moduleName}`,
          });
        }
      }
    }

    return routes;
  } catch (error) {
    console.error('扫描路由失败:', error);
    return [];
  }
}

/**
 * 生成路由注册代码
 */
export function generateRouteRegistration(routes: RouteInfo[]): string {
  if (routes.length === 0) {
    return '';
  }

  // 生成导入语句
  const imports = routes
    .map((route) => `import { ${route.importName} } from '${route.filePath}';`)
    .join('\n');

  // 生成注册语句
  const registrations = routes
    .map((route) => `app.route('${route.routePath}', ${route.importName});`)
    .join('\n  ');

  return `// ========== 自动生成的路由注册 ==========
${imports}

// 注册路由
function registerRoutes(app: Hono) {
  ${registrations}
}`;
}

/**
 * 更新 router.ts 文件，自动注册路由
 */
export function updateRouterFile(routerFilePath: string, routes: RouteInfo[]): void {
  try {
    let content = fs.readFileSync(routerFilePath, 'utf-8');

    // 生成导入语句
    const imports = routes
      .map((route) => `import { ${route.importName} } from '${route.filePath}';`)
      .join('\n');

    // 生成注册语句
    const registrations = routes
      .map((route) => `router.route('${route.routePath}', ${route.importName});`)
      .join('\n');

    // 查找是否有自动注册标记
    const autoRegisterStart = '// ========== AUTO-REGISTER START ==========';
    const autoRegisterEnd = '// ========== AUTO-REGISTER END ==========';

    if (content.includes(autoRegisterStart)) {
      // 替换自动注册区域
      const regex = new RegExp(`${autoRegisterStart}[\\s\\S]*?${autoRegisterEnd}`, 'g');
      content = content.replace(
        regex,
        `${autoRegisterStart}\n${imports}\n\n// 注册路由\n${registrations}\n${autoRegisterEnd}`,
      );
    } else {
      // 在文件末尾添加自动注册区域
      content += `\n\n${autoRegisterStart}\n${imports}\n\n// 注册路由\n${registrations}\n${autoRegisterEnd}\n`;
    }

    fs.writeFileSync(routerFilePath, content);
    console.log('✅ 已更新 router.ts 路由注册');
  } catch (error) {
    console.error('❌ 更新 router.ts 失败:', error);
  }
}

/**
 * 扫描 schema 目录，找到所有 schema 文件
 */
export function scanSchemas(schemaDir: string): string[] {
  const schemas: string[] = [];

  try {
    if (!fs.existsSync(schemaDir)) {
      return schemas;
    }

    const files = fs.readdirSync(schemaDir);

    for (const file of files) {
      if (file.endsWith('.ts') && file !== 'index.ts') {
        const schemaName = file.replace('.ts', '');
        schemas.push(schemaName);
      }
    }

    return schemas;
  } catch (error) {
    console.error('扫描 schema 失败:', error);
    return [];
  }
}

/**
 * 更新 schema/index.ts 文件
 */
export function updateSchemaIndex(schemaIndexPath: string, schemas: string[]): void {
  try {
    const exports = schemas.map((schema) => `export * from './${schema}';`).join('\n');

    const content = `/**
 * Schema 导出
 * 自动生成 - 请勿手动修改
 */

${exports}
`;

    fs.writeFileSync(schemaIndexPath, content);
    console.log('✅ 已更新 schema/index.ts');
  } catch (error) {
    console.error('❌ 更新 schema/index.ts 失败:', error);
  }
}
