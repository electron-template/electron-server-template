import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import Chalk from 'chalk';
import { getSecureWindowPreferences } from '../modules/security';
import { getAppInfo } from '../modules/lifecycle';
import { WindowConfig } from '../modules/types';

// 预加载脚本路径
const preloadPath = join(__dirname, '../..', 'preload.js');

/**
 * 创建主应用窗口
 * @param config 窗口配置选项
 * @returns 创建的BrowserWindow实例
 */
export default async function createWindow(
  config?: Partial<WindowConfig>,
): Promise<BrowserWindow> {
  // 合并默认配置与传入配置
  const windowConfig: WindowConfig = {
    width: config?.width || 800,
    height: config?.height || 600,
    backgroundColor: config?.backgroundColor || '#fff',
    showOnReady: config?.showOnReady !== undefined ? config.showOnReady : true,
    devTools:
      config?.devTools !== undefined
        ? config.devTools
        : process.env.NODE_ENV === 'development',
    resizable: config?.resizable !== undefined ? config.resizable : true,
    title: config?.title || 'Electron Server Template',
  };

  // 创建主窗口
  const mainWindow = new BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    webPreferences: getSecureWindowPreferences(preloadPath),
    show: !windowConfig.showOnReady, // 初始不显示，等待ready-to-show事件后显示
    backgroundColor: windowConfig.backgroundColor,
    resizable: windowConfig.resizable,
    title: windowConfig.title,
  });

  // 开发环境自动打开开发者工具
  if (windowConfig.devTools) {
    mainWindow.webContents.openDevTools();
  }

  // 优化窗口加载性能
  if (windowConfig.showOnReady) {
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
  }

  // 根据环境加载内容
  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${rendererPort}`);
  } else {
    await mainWindow.loadFile(
      join(app.getAppPath(), '/renderer', 'index.html'),
    );
  }

  // 优化外部链接处理
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // 监听web加载完毕
  await new Promise<void>((resolve, reject) => {
    mainWindow.webContents.on('did-finish-load', () => {
      // 使用批量数据传输优化IPC通信
      mainWindow.webContents.send('initial-state', getAppInfo());

      console.log(
        `${Chalk.greenBright('=======================================')}`,
      );
      console.log(`${Chalk.greenBright('窗口启动成功')}`);
      console.log(
        `${Chalk.greenBright('=======================================')}`,
      );
      resolve();
    });

    mainWindow.webContents.on(
      'did-fail-load',
      (_, errorCode, errorDescription) => {
        console.log(
          `${Chalk.redBright('=======================================')}`,
        );
        console.log(
          `${Chalk.redBright(`窗口启动失败: ${errorCode} - ${errorDescription}`)}`,
        );
        console.log(
          `${Chalk.redBright('=======================================')}`,
        );
        reject(new Error(`加载失败: ${errorDescription}`));
      },
    );

    // 超时处理
    setTimeout(() => {
      reject(new Error('窗口加载超时'));
    }, 30000); // 30秒超时
  });

  // 优化垃圾回收
  mainWindow.on('closed', () => {
    // 手动清除引用，帮助垃圾回收
    global.gc && global.gc();
  });

  return mainWindow;
}

/**
 * 设置窗口功能处理程序
 */
export function setupWindowHandlers(): void {
  // 处理 Mac 应用激活
  app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
      allWindows[0].focus();
    } else {
      createWindow();
    }
  });

  // 处理第二实例启动事件
  app.on('second-instance', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
      const mainWindow = allWindows[0];
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}
