import { app } from 'electron';

/**
 * 确保应用只有一个实例运行
 * @returns 是否是首个实例
 */
export function ensureSingleInstance(): boolean {
  // 尝试获取锁
  const gotTheLock = app.requestSingleInstanceLock();

  // 如果获取锁失败，说明已经有一个实例在运行
  if (!gotTheLock) {
    app.quit();
    process.exit(0);
    return false;
  }

  return true;
}

/**
 * 设置应用程序的生命周期事件处理
 * @param stopServerHandler 停止服务器的回调函数
 */
export function setupAppLifecycle(
  stopServerHandler: () => Promise<void>,
): void {
  // 当窗口全部关闭时，退出应用
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      stopServerHandler?.();
      app.quit();
    }
  });

  // 应用关闭前清理
  app.on('before-quit', () => {
    // 停止服务器
    stopServerHandler?.();
  });

  // 确保干净退出
  app.on('will-quit', () => {
    process.exit(0);
  });
}

/**
 * 获取应用信息
 * @returns 应用信息对象
 */
export function getAppInfo() {
  return {
    appVersion: app.getVersion(),
    platform: process.platform,
    isProduction: process.env.NODE_ENV === 'production',
    appName: app.getName(),
  };
}
