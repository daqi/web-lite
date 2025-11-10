import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    sequence: {
      concurrent: false, // 串行执行测试文件
    },
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.config.ts",
        "**/*.d.ts",
        "plop-templates/",
      ],
    },
  }
});
