# 命名规范
“命名规范”是软件开发中保证**一致性、可维护性、可读性**的关键。下面我将为你系统总结开发中的命名规范，涵盖：

* 🧩 **数据库层（表、字段、类型）**
* 🧠 **代码层（变量、函数、类）**
* 🌐 **接口层（API 命名与设计）**

---

## 🧩 一、数据库命名规范（表、字段、类型）

### 1. 总体原则

* **统一风格**：全部小写，单词间用下划线 `_` 分隔（snake_case）。
* **见名知意**：名称应清晰表达业务含义。
* **避免缩写**：除非是通用缩写（如 `id`, `url`, `ip`）。
* **单数命名**：表名使用单数形式，如 `user` 而不是 `users`。

---

### 2. 表命名规则

| 类型       | 命名规则                     | 示例                                 |
| -------- | ------------------------ | ---------------------------------- |
| 主业务表     | 业务对象名                    | `user`, `order`, `product`         |
| 关联表（多对多） | `主表_副表`                  | `user_role`, `student_course`      |
| 日志表      | `xxx_log`                | `operation_log`, `login_log`       |
| 配置/字典表   | `xxx_config`, `xxx_dict` | `system_config`, `error_code_dict` |

---

### 3. 字段命名规则

| 类型   | 命名规则                         | 示例                        |
| ---- | ---------------------------- | ------------------------- |
| 主键   | `id`                         | `id`                      |
| 外键   | `关联表名_id`                    | `user_id`, `role_id`      |
| 状态字段 | `xxx_status`（值用枚举）           | `order_status`            |
| 时间字段 | `created_at`, `updated_at` | 常规审计字段                    |
| 标志字段 | `is_xxx`，类型 `tinyint(1)`     | `is_deleted`, `is_active` |

---

### 4. 字段类型建议

| 数据类型                     | 用途      | 说明                 |
| ------------------------ | ------- | ------------------ |
| `int` / `bigint`         | 主键、自增ID | `bigint` 推荐用于分布式ID |
| `varchar(n)`             | 字符串     | 一般长度 `<=255`       |
| `text`                   | 长文本     | 非检索字段              |
| `datetime` / `timestamp` | 时间      | 推荐统一时区             |
| `decimal(p,s)`           | 金额      | 避免浮点误差             |
| `tinyint(1)`             | 布尔      | 表示 `true/false`    |

---

## 🧠 二、代码命名规范

### 1. 通用命名风格

| 类型      | 风格              | 示例                               |
| ------- | --------------- | -------------------------------- |
| 变量、函数   | 小驼峰（camelCase）  | `userName`, `getUserInfo()`      |
| 类、构造函数  | 大驼峰（PascalCase） | `UserService`, `OrderController` |
| 常量      | 全大写 + 下划线       | `MAX_RETRY_COUNT`                |
| 包 / 模块名 | 全小写             | `user`, `order_service`          |

---

### 2. 变量命名建议

* **布尔类型**：用 `is`, `has`, `can`, `should` 开头
  例如：`isActive`, `hasPermission`, `canDelete`
* **集合/数组**：用复数形式
  例如：`users`, `orderList`
* **临时变量**：避免使用 `a`, `b`, `tmp` 等无意义名称
* **上下文明确**：名称体现单位或范围，如：`timeoutMs`, `priceCny`

---

### 3. 函数/方法命名建议

* 动词 + 名词结构，如：

  * `getUserInfo()`
  * `updateOrderStatus()`
  * `calculateDiscount()`
* 事件处理函数常用 `on` 开头：

  * `onUserLogin()`, `onClickSubmit()`
* 返回布尔值的方法：用 `is/has/can` 开头

  * `isValidUser()`, `hasPermission()`

---

### 4. 类 / 文件命名

| 类型  | 规则             | 示例                            |
| --- | -------------- | ----------------------------- |
| 实体类 | 名词             | `User`, `Order`               |
| 服务类 | 动词+Service     | `UserService`, `EmailService` |
| 控制器 | 资源名+Controller | `UserController`              |
| 工具类 | 功能名+Util       | `DateUtil`, `StringUtil`      |

---

## 🌐 三、API 命名规范

### 1. 基础规则（RESTful风格）

| 动作   | HTTP 方法     | 路径示例              |
| ---- | ----------- | ----------------- |
| 查询列表 | GET         | `/api/users`      |
| 查询单个 | GET         | `/api/users/{id}` |
| 创建   | POST        | `/api/users`      |
| 更新   | PUT / PATCH | `/api/users/{id}` |
| 删除   | DELETE      | `/api/users/{id}` |

* 路径使用**名词（资源）**，不使用动词。
* 多级资源用 `/` 分层：`/api/users/{id}/orders`
* 版本号建议放在前缀：`/api/v1/users`

---

### 2. 参数与响应命名

* 参数与字段使用小驼峰：`userId`, `pageSize`, `orderStatus`
* 返回结果统一格式（建议）：

  ```json
  {
    "code": 0,
    "message": "success",
    "data": { ... }
  }
  ```
