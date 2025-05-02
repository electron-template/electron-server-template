import { session } from 'electron';

/**
 * 设置应用程序的安全策略
 */
export function setupSecurityPolicies(): void {
  // 设置内容安全策略
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self' data:",
        ].join('; '),
      },
    });
  });
}

/**
 * 配置安全的窗口参数
 * @returns 安全的窗口WebPreferences配置对象
 */
export function getSecureWindowPreferences(
  preloadPath: string,
): Electron.WebPreferences {
  return {
    preload: preloadPath,
    // 禁用Node集成
    nodeIntegration: false,
    // 启用上下文隔离
    contextIsolation: true,
    // 优化渲染性能
    backgroundThrottling: false,
    // 启用硬件加速
    webgl: true,
    // 仅在生产环境启用同源策略
    webSecurity: process.env.NODE_ENV !== 'development',
    // 禁用WebSQL
    enableWebSQL: false,
    // 禁止运行不安全的内容
    allowRunningInsecureContent: false,
  };
}
