# 依赖管理指南

本文档提供了项目依赖管理的最佳实践和操作指南。

## 依赖管理原则

1. **最小化依赖**: 仅引入必要的依赖，避免项目臃肿和潜在风险
2. **版本锁定**: 使用精确版本或合理的版本范围，避免意外更新带来的兼容性问题
3. **定期更新**: 定期检查和更新依赖，确保安全性和性能优化
4. **分离依赖**: 正确区分开发依赖和生产依赖

## 常用命令

### 检查和审计依赖

```bash
# 运行依赖审计脚本 (检查漏洞和过时依赖)
pnpm audit-deps

# 仅查看过时依赖
pnpm outdated
```

### 更新依赖

```bash
# 更新所有依赖到兼容版本 (遵循版本约束)
pnpm update-deps

# 更新特定依赖
pnpm update [package-name]

# 安装特定版本
pnpm add [package-name]@[version] -D  # 开发依赖
pnpm add [package-name]@[version]     # 生产依赖
```

## 依赖分类指南

### 生产依赖 (dependencies)

包含应用运行时必需的依赖，例如：

- 框架核心库 (Vue, Express, NestJS 等)
- UI 组件库 (Element Plus 等)
- 网络请求库 (axios 等)
- 状态管理库 (Pinia 等)
- 路由库 (vue-router 等)

### 开发依赖 (devDependencies)

仅在开发、构建、测试过程中使用的依赖，例如：

- 构建工具 (Vite, Webpack, Electron Builder 等)
- 测试框架 (Jest 等)
- 代码检查工具 (ESLint, Prettier 等)
- 类型定义 (@types/* 等)
- 开发服务器工具
- CLI 工具

## 版本号规范

项目使用语义化版本控制 (Semantic Versioning)：

- `^x.y.z`: 允许更新次版本号和补丁版本 (y 和 z)
- `~x.y.z`: 只允许更新补丁版本 (z)
- `x.y.z`: 锁定特定版本

对于核心依赖和有严格兼容性要求的库，推荐使用锁定版本或 `~` 前缀。
对于一般工具库和相对稳定的依赖，可以使用 `^` 前缀。

## 依赖审计周期

建议：

- 每周运行一次依赖审计检查安全漏洞
- 每月评估和更新过时依赖
- 每季度全面审查依赖结构，移除不必要依赖

## 问题排查

如遇依赖相关问题，可尝试：

1. 清除依赖缓存: `pnpm store prune`
2. 重新安装所有依赖: `rm -rf node_modules && pnpm install`
3. 检查特定依赖版本冲突: `pnpm why [package-name]` 