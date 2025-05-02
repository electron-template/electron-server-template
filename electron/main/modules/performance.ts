import { app } from 'electron';
import os from 'node:os';

/**
 * 设置应用性能参数
 * 根据不同操作系统优化性能设置
 */
export function setupPerformance(): void {
  // 操作系统特定优化
  if (os.release().startsWith('6.1')) {
    // Windows 7 特定优化：禁用硬件加速
    app.disableHardwareAcceleration();
  } else {
    // 现代操作系统：启用硬件加速，提高渲染性能
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    app.commandLine.appendSwitch('enable-zero-copy');
    app.commandLine.appendSwitch(
      'enable-hardware-overlays',
      'single-fullscreen,single-on-top',
    );
  }

  // 内存优化
  app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');

  // Linux 特定优化
  if (process.platform === 'linux') {
    app.commandLine.appendSwitch('disable-gpu-memory-buffer-video-frames');
  }

  // Windows 10+ 通知应用名称设置
  if (process.platform === 'win32') {
    app.setAppUserModelId(app.getName());
  }
}

/**
 * 设置定期垃圾回收
 * 帮助应用长时间运行时保持良好性能
 */
export function setupGarbageCollection(): void {
  // 定期回收内存，优化应用长时间运行性能
  setInterval(
    () => {
      if (global.gc) {
        global.gc();
      }
    },
    15 * 60 * 1000,
  ); // 每15分钟进行一次垃圾回收
}

/**
 * 清理资源，关闭时调用
 */
export function cleanupResources(): void {
  if (global.gc) {
    global.gc();
  }
}
