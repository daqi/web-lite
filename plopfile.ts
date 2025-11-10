import { NodePlopAPI } from 'plop';
import { pascalCase, camelCase } from 'change-case';

export default function (plop: NodePlopAPI) {
  // 注册 helper
  plop.setHelper('pascalCase', (text: string) => pascalCase(text));
  plop.setHelper('camelCase', (text: string) => camelCase(text));

  // 生成模块
  plop.setGenerator('module', {
    description: '生成新的业务模块 (Repository + Service + Route + Validator)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: '模块名称 (例如: product, order):',
        validate: (input: string) => {
          if (!input) return '模块名称不能为空';
          if (!/^[a-z]+$/.test(input)) return '请使用小写字母';
          return true;
        },
      },
    ],
    actions: [
      // Repository
      {
        type: 'add',
        path: 'src/modules/{{camelCase name}}/{{camelCase name}}.repository.ts',
        templateFile: 'plop-templates/repository.hbs',
      },
      // Service
      {
        type: 'add',
        path: 'src/modules/{{camelCase name}}/{{camelCase name}}.service.ts',
        templateFile: 'plop-templates/service.hbs',
      },
      // Route
      {
        type: 'add',
        path: 'src/modules/{{camelCase name}}/{{camelCase name}}.route.ts',
        templateFile: 'plop-templates/route.hbs',
      },
      // Index
      {
        type: 'add',
        path: 'src/modules/{{camelCase name}}/index.ts',
        templateFile: 'plop-templates/index.hbs',
      },
      // 提示
      () => {
        return `
✅ 模块创建成功!

📝 下一步操作:
1. 在 src/db/schema/ 中创建对应的数据表定义
2. 运行 pnpm run generate:validators 生成校验器
3. 在 src/app.ts 中注册路由
`;
      },
    ],
  });
}
