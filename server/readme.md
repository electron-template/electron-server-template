# NestJS MVC架构服务器

本服务器采用标准的NestJS MVC架构设计，结构清晰，职责分明。

## 目录结构

```
server/
├── src/                  # 源代码目录
│   ├── main.ts           # 应用程序入口文件
│   ├── app.module.ts     # 应用程序根模块
│   │
│   ├── modules/          # 按业务功能划分的模块
│   │   ├── users/        # 用户模块示例
│   │   │   ├── controllers/    # 控制器层 - 处理HTTP请求
│   │   │   │   └── users.controller.ts
│   │   │   ├── models/         # 模型层 - 数据库实体定义
│   │   │   │   └── user.entity.ts
│   │   │   ├── services/       # 服务层 - 业务逻辑处理
│   │   │   │   └── users.service.ts
│   │   │   ├── dtos/           # 数据传输对象
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── interfaces/     # 接口定义
│   │   │   │   └── user.interface.ts
│   │   │   └── users.module.ts # 用户模块定义
│   │   │
│   │   ├── products/      # 产品模块示例
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── common/          # 通用功能目录
│   │   ├── decorators/  # 自定义装饰器
│   │   ├── filters/     # 异常过滤器
│   │   ├── guards/      # 路由守卫
│   │   ├── interfaces/  # 通用接口
│   │   ├── middlewares/ # 中间件
│   │   ├── pipes/       # 验证管道
│   │   └── ...
│   │
│   └── config/         # 应用配置
│       ├── database.config.ts
│       └── app.config.ts
│
├── test/              # 测试文件
│   ├── unit/          # 单元测试
│   └── e2e/           # 端到端测试
│
└── node_modules/      # 项目依赖
```

## MVC架构说明

### 模型层 (Model)
- **实体(Entity)**: 数据库表对应的实体类
- **仓库(Repository)**: 提供数据访问方法
- **DTO(Data Transfer Object)**: 定义数据传输结构

### 服务层 (Service - 相当于MVC中的Model业务逻辑部分)
- 封装业务逻辑
- 调用数据访问层
- 实现业务规则
- 不涉及HTTP相关内容

### 控制器层 (Controller)
- 处理HTTP请求和响应
- 调用服务层处理业务
- 返回适当的状态码和响应体
- 不包含业务逻辑

### 视图 (View)
在NestJS中，视图层通常以两种形式体现：
1. **响应转换**: 通过拦截器或类序列化器处理
2. **模板渲染**: 对于服务端渲染应用

## 模块化设计

每个业务功能(如用户管理、产品管理)都应该是一个独立的模块，包含其自身的MVC组件：

```
users/
├── controllers/  # 控制器
├── models/       # 实体定义
├── services/     # 业务逻辑
├── dtos/         # 数据传输对象
└── users.module.ts
```

## 最佳实践

1. **关注点分离**: 确保每个组件只负责单一职责
2. **依赖注入**: 使用NestJS的依赖注入系统管理组件依赖
3. **层次化架构**: 严格遵循Controller -> Service -> Repository的调用层次
4. **显式API**: 明确定义接口和DTO，确保类型安全