# Electron 应用性能优化指南

本文档详细介绍了项目中采用的性能优化策略和技巧，以帮助开发者理解和维护高性能的 Electron 应用。

## 主进程优化

### 启动优化

- **并行初始化**：使用 `Promise.all` 并行处理各个模块的初始化，减少启动时间
- **延迟加载**：非关键组件采用延迟加载策略
- **硬件加速**：根据平台特性智能启用/禁用硬件加速

```javascript
// 优化案例
const initPromises = [
  Promise.resolve(createTray()),
  Promise.resolve(createRequest()),
  createServer().then(handler => { ... })
];
await Promise.all(initPromises);
```

### 内存管理

- **定期垃圾回收**：设置定时器定期触发垃圾回收
- **资源释放**：应用关闭前主动释放资源
- **内存限制**：通过 `--max-old-space-size` 设置合理的内存限制

```javascript
// 内存优化示例
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');

// 定期垃圾回收
setInterval(() => {
  if (global.gc) global.gc();
}, 15 * 60 * 1000);
```

## 渲染进程优化

### 窗口渲染优化

- **延迟显示窗口**：使用 `show: false` 和 `ready-to-show` 事件优化窗口显示时机
- **避免闪烁**：设置背景色与应用一致，避免白屏闪烁
- **CSS 硬件加速**：使用 `transform`、`will-change` 等属性触发 GPU 加速

```javascript
// 窗口渲染优化
const mainWindow = new BrowserWindow({
  show: false,
  backgroundColor: '#fff',
  // ...
});

mainWindow.once('ready-to-show', () => {
  mainWindow.show();
});
```

### Vue 性能优化

- **按需加载组件**：避免全局注册所有组件
- **虚拟滚动**：大数据列表使用虚拟滚动技术
- **组件懒加载**：非关键路由和组件使用动态导入

```javascript
// Vue 性能优化
if (process.env.NODE_ENV === 'production') {
  app.config.performance = false;
  app.config.warnHandler = () => null;
}

// 路由懒加载
setTimeout(() => {
  router.getRoutes().forEach(route => {
    if (route.components?.default && typeof route.components.default === 'function') {
      route.components.default()
    }
  })
}, 1000);
```

## IPC 通信优化

### 批量传输

- **合并消息**：避免频繁小数据传输，合并为批量数据
- **节流和防抖**：对高频 IPC 调用进行节流处理
- **双向通信优化**：使用 `invoke/handle` 代替 `send/on` 组合

```javascript
// IPC 优化：节流
send: throttle((...args) => {
  const [channel, ...omit] = args;
  return ipcRenderer.send(channel, ...omit);
}, 50)
```

### 缓存策略

- **请求缓存**：对 API 请求结果进行缓存
- **缓存过期控制**：设置合理的缓存过期时间
- **缓存清理**：定期清理过期缓存，避免内存泄漏

```javascript
// 请求缓存
if (cacheKey && requestCache.has(cacheKey)) {
  const { response, timestamp } = requestCache.get(cacheKey);
  if (Date.now() - timestamp < CACHE_DURATION) {
    return response;
  }
  requestCache.delete(cacheKey);
}
```

## CSS 和动画优化

- **CSS 性能优化**：使用 `will-change`、`transform: translateZ(0)` 提示浏览器优化渲染
- **减少重绘和回流**：合理组织 DOM 操作，避免频繁样式变更
- **图片优化**：使用适当大小和格式的图片，考虑使用 WebP 格式

```css
/* CSS 性能优化 */
.animation-element {
  will-change: transform;
  transform: translateZ(0);
}
```

## 网络请求优化

- **请求合并**：合并多个小请求为一个大请求
- **超时控制**：设置合理的请求超时时间
- **错误处理**：统一处理网络错误，提供友好反馈

```javascript
// 网络请求优化
const axiosInstance = axios.create({
  timeout: 10000,
  headers: { 'X-Client-Type': 'electron-app' }
});
```

## 构建优化

- **代码分割**：使用动态导入拆分代码包
- **Tree Shaking**：移除未使用的代码
- **压缩优化**：使用高效的压缩算法减小包体积

## 性能监控

- **性能指标收集**：收集关键性能指标
- **错误追踪**：监控和记录运行时错误
- **用户体验监测**：监测和分析用户交互性能

## 最佳实践

1. **避免同步操作**：在主进程中避免长时间的同步操作
2. **减少 IPC 通信**：过多的 IPC 通信会降低性能
3. **使用 Web Worker**：将计算密集型任务放入 Web Worker
4. **按需加载资源**：非必要资源延迟加载
5. **避免内存泄漏**：注意清理事件监听器和定时器

## 调试和分析工具

- **Chrome DevTools**：使用内置的性能分析工具
- **Electron Inspector**：分析 Electron 应用性能
- **Memory Snapshot**：检测内存泄漏问题

## 参考资源

- [Electron 官方性能优化指南](https://www.electronjs.org/docs/latest/tutorial/performance)
- [Vue 性能优化指南](https://vuejs.org/guide/best-practices/performance.html)
- [Chrome DevTools 性能分析](https://developer.chrome.com/docs/devtools/performance) 